import React, {useEffect} from 'react';
import {Divider, Form, Input, List, message, Modal, Typography} from 'antd';
import CronComponent from "./CronComponent";
import { nextTriggerTime } from '../service';

interface CreateFormProps {
  modalVisible: boolean;
  onCancel: (flag?: boolean) => void;
  onSubmit: (values: Partial<API.SpiderTask>) => void;
}

const cronTip = (
  <span>
    （1）*：表示匹配该域的任意值。假如在Minutes域使用*, 即表示每分钟都会触发事件。<br/>
    （2）?：只能用在DayofMonth和DayofWeek两个域。它也匹配域的任意值，但实际不会。因为DayofMonth和DayofWeek会相互影响。例如想在每月的20日触发调度，不管20日到底是星期几，则只能使用如下写法： 13 13 15 20 * ?, 其中最后一位只能用？，而不能使用*，如果使用*表示不管星期几都会触发，实际上并不是这样。<br/>
    （3）-：表示范围。例如在Minutes域使用5-20，表示从5分到20分钟每分钟触发一次。<br/>
    （4）/：表示起始时间开始触发，然后每隔固定时间触发一次。例如在Minutes域使用5/20,则意味着5分钟触发一次，而25，45等分别触发一次。<br/>
    （5）,：表示列出枚举值。例如：在Minutes域使用5,20，则意味着在5和20分每分钟触发一次。<br/>
    （6）L：表示最后，只能出现在DayofWeek和DayofMonth域。如果在DayofWeek域使用5L,意味着在最后的一个星期四触发。<br/>
    （7）W:表示有效工作日(周一到周五),只能出现在DayofMonth域，系统将在离指定日期的最近的有效工作日触发事件。例如：在 DayofMonth使用5W，如果5日是星期六，则将在最近的工作日：星期五，即4日触发。如果5日是星期天，则在6日(周一)触发；如果5日在星期一到星期五中的一天，则就在5日触发。另外一点，W的最近寻找不会跨过月份 。<br/>
    （8）LW:这两个字符可以连用，表示在某个月最后一个工作日，即最后一个星期五。<br/>
    （9）#:用于确定每个月第几个星期几，只能出现在DayofMonth域。例如在4#2，表示某月的第二个星期三。
  </span>
);

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const [form] = Form.useForm();
  const [inputValue, setInputValue] = React.useState("* * * * * ? *");
  const [errMsg, setErrMsg] = React.useState("");
  const [nextTimeList, setNextTimeList] = React.useState<string[]>([]);

  const {
    modalVisible,
    onSubmit: handleCreate,
    onCancel: handleCreateModalVisible,
  } = props;

  useEffect(()=>{
    if (!modalVisible){
      return;
    }
    nextTriggerTime(inputValue).then((res: string[]) => {
      if(res && res.length === 5){
        setNextTimeList(res);
        form.setFieldsValue({
          cronExpression: inputValue,
        });
      }else{
        setErrMsg(res[0]);
      }
    }).catch(() => {
      message.error('获取下次执行时间失败，请重试');
    });
  },[modalVisible]);

  const handleNext = async () => {
    const fieldsValue: any = await form.validateFields();
    handleCreate({
      ...fieldsValue,
    });
  };

  const handlerInput = async (index: number,value: string) => {
    const regs: any[] = inputValue.split(' ');
    regs[index] = value;
    const tempValue = regs.join(' ');
    nextTriggerTime(tempValue).then((res: string[]) => {
      if(res && res.length === 5){
        setNextTimeList(res);
        setInputValue(tempValue);
        form.setFieldsValue({
          cronExpression: tempValue,
        });
      }else{
        setErrMsg(res[0])
      }
    }).catch(() => {
      message.error('获取下次执行时间失败，请重试');
    });
  }

  return (
    <Modal
      destroyOnClose
      title="新建任务"
      width={640}
      visible={modalVisible}
      onCancel={() => handleCreateModalVisible(false)}
      onOk={() => handleNext()}
    >
      <Form
        {...formLayout}
        form={form}
      >
        <FormItem
          name="cronExpression"
          label="Cron 表达式"
          rules={[{ required: true, message: '请输入Cron 表达式！' }]}
          tooltip= {{title:cronTip, placement: 'topLeft', overlayStyle: { maxWidth: 600 }, arrowPointAtCenter: true, color:'cyan'}}
        >
          <Input placeholder="请输入Cron 表达式" value={inputValue}/>
        </FormItem>
        <CronComponent
          onChange={handlerInput}
        />
        <Divider orientation="left">最近运行时间</Divider>
        {errMsg?.length !== 0 && (
          <Typography.Text type="danger">{errMsg}</Typography.Text>
        )}
        {errMsg?.length === 0 && (
          <List
            dataSource={nextTimeList}
            size="small"
            renderItem={item => (
              <List.Item>
                <Typography.Text>{item}</Typography.Text>
              </List.Item>
            )}
          />
        )}

      </Form>
    </Modal>
  );
};

export default CreateForm;
