import React, {useState} from 'react';
import {Button, Col, Form, Input, Modal, Row, Select} from 'antd';
import CronModal from './CronModal';

interface CreateFormProps {
  modalVisible: boolean;
  onCancel: (flag?: boolean) => void;
  onSubmit: (values: Partial<API.SpiderTask>) => void;
}

const FormItem = Form.Item;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const CreateForm: React.FC<CreateFormProps> = (props) => {
  /** 新建窗口的弹窗 */
  const [cronModalVisible, handleCronModalVisible] = useState<boolean>(false);
  const [cronExpressValue, setCronExpressValue] = useState("");
  const [data, setData] = useState([])
  const [form] = Form.useForm();

  const {
    modalVisible,
    onSubmit: handleCreate,
    onCancel: handleCreateModalVisible,
  } = props;

  const handleNext = async () => {
    const fieldsValue: any = await form.validateFields();
    handleCreate({
      ...fieldsValue,
    });
  };

  const handleSearch = (value: any) => {
    console.log(value);
    // if (searchValue) {
    //   fetch(value, data => this.setState({ data }));
    // } else {
    //   this.setState({ data: [] });
    // }
  };

  const handleChange = (value: any) => {
    console.log(value);
    // this.setState({ value });
  };

  return (
    <Modal
      destroyOnClose
      title="新建任务"
      width={900}
      visible={modalVisible}
      onCancel={() => handleCreateModalVisible(false)}
      onOk={() => handleNext()}
    >
      <Form
        {...formLayout}
        form={form}
      >
        <Row>
          <Col span={12}>
            <FormItem
              name="taskName"
              label="任务名称"
              rules={[{ required: true, message: '请输入任务名称！' }]}
            >
              <Input placeholder="请输入任务名称" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              name="handlerName"
              label="handlerName"
              rules={[{ required: true, message: '请输入handlerName！' }]}
            >
              <Input placeholder="请输入handlerName" />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              name="spiderId"
              label="选择爬虫"
            >
              <Select
                showSearch
                value={'测试'}
                placeholder={'请输入爬虫名称'}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={handleSearch}
                onChange={handleChange}
                notFoundContent={null}
              >
                {/* {options} */}
            </Select>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              name="cronExpression"
              label="Cron 表达式"
              rules={[{ required: true, message: '请输入Cron 表达式！' }]}>
              <Input.Group compact>
                <Input placeholder="请输入Cron 表达式" style={{ width: 'calc(100% - 50%)' }} defaultValue={cronExpressValue}/>
                <Button
                  type="primary"
                  onClick={() => {
                    handleCronModalVisible(true);
                  }}
                >
                  Cron 工具
                </Button>
              </Input.Group>
            </FormItem>
          </Col>
        </Row>

        <CronModal
          modalVisible={cronModalVisible}
          onCancel={() => handleCronModalVisible(false)}
          onSubmit={(value)=>{
            setCronExpressValue(value);
            handleCronModalVisible(false);
          }}
        />
      </Form>
    </Modal>
  );
};

export default CreateForm;
