import { PlusOutlined } from '@ant-design/icons';
import {Button, message, Divider} from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import UpdateForm from './components/UpdateForm';
import { fetchScheduleTaskPage, addScheduleTask, updateScheduleTask, removeScheduleTask, startScheduleTask, stopScheduleTask, runTask } from '@/services/open-crawler/spidertask';
import {confirmModal} from "@/components/ConfirmModel";
import CreateForm from "./components/CreateForm";
import { Link } from 'umi';

/**
 * 添加节点
 *
 * @param fields
 */
const handleAdd = async (fields: Partial<API.SpiderTask>) => {
  const hide = message.loading('正在添加');
  try {
    const result = await addScheduleTask(fields);
    hide();
    if(result) message.success('添加成功');
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
  }
};

/**
 * 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<API.SpiderTask>) => {
  const hide = message.loading('正在配置');
  try {
    const result = await updateScheduleTask(fields);
    hide();
    if(result) message.success('配置成功');
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
  }
};

/**
 * 运行爬虫
 *
 * @param spiderId
 */
 const handleRun = async (taskId: number) => {
  try {
    const result = await runTask(taskId);
    if(result) message.success('运行成功');
  } catch (error) {
    message.error('运行失败，请重试');
  }
};

/**
 * 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: any[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return;
  try {
    const result = await removeScheduleTask({ids: selectedRows});
    hide();
    if(result) message.success('删除成功，即将刷新');
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
  }
};

const TableList: React.FC = () => {
  /** 新建窗口的弹窗 */
  const [createModalVisible, handleCreateModalVisible] = useState<boolean>(false);
  /** 分布更新窗口的弹窗 */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [updateFormValues, setUpdateFormValues] = useState({});

  const actionRef = useRef<ActionType>();
  // const [currentRow, setCurrentRow] = useState<ScheduleTask>();
  const [selectedRowsState, setSelectedRows] = useState<API.SpiderTask[]>([]);

  const columns: ProColumns<API.SpiderTask>[] = [
    {
      title: '爬虫ID',
      dataIndex: 'spiderId',
      valueType: 'text',
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      valueType: 'text',
    },
    {
      title: 'handlerName',
      dataIndex: 'handlerName',
      valueType: 'text',
    },
    {
      title: 'Cron 表达式',
      dataIndex: 'cronExpression',
      valueType: 'text',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: { text: '停止', status: 'Error' },
        1: { text: '启动', status: 'Success' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      hideInForm: true,
      search: false,
    },
    {
      title: '创建人',
      dataIndex: 'createUser',
      valueType: 'text',
      hideInForm: true,
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => handleRun(record.id).then()}
          >
            运行
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              if (record.status === 0) {
                startScheduleTask(record.id).then();
              }else {
                stopScheduleTask(record.id).then();
              }
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }}
          >
            {record.status === 0 ? '启动': '停止'}
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setUpdateFormValues(record);
            }}
          >
            修改
          </a>
          <Divider type="vertical" />
          <a
            onClick={async () => {
              const confirm = await confirmModal();
              if (confirm){
                await handleRemove([record.id]);
                actionRef.current?.reloadAndRest?.();
              }
            }}
          >
            删除
          </a>
          <Divider type="vertical" />
          <Link
            to={{
              pathname: '/taskLog',
              search: `?id=${record.id}`,
              hash: '#the-hash',
              state: { fromDashboard: true },
            }}
          >
            查看日志
          </Link>
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.SpiderTask>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}

        request={async (params) => {
          const response = await fetchScheduleTaskPage({ ...params });
          return {
            data: response.records,
            total: response.total,
            success: true,
            pageSize: response.pages,
            current: response.current,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项&nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState ? selectedRowsState.map((e) => e.id):[]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      <CreateForm
        onSubmit={async (value) => {
          const success = await handleAdd(value);
          if (success) {
            handleCreateModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => handleCreateModalVisible(false)}
        modalVisible={createModalVisible}>
      </CreateForm>
      {updateFormValues && Object.keys(updateFormValues).length ? (
        <UpdateForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalVisible(false);
              setUpdateFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setUpdateFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={updateFormValues}
        />
      ) : null}
    </PageContainer>
  );
};

export default TableList;
