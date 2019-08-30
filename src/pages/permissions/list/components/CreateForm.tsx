import { Form, Input, Modal } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import React from 'react';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 15,
  },
};

interface CreateFormProps extends FormComponentProps {
  modalVisible: boolean;
  handleAdd: (values: object, callback?: () => void) => void;
  handleModalVisible: () => void;
  loading: boolean;
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const { modalVisible, form, handleAdd, handleModalVisible, loading } = props;
  const { getFieldDecorator } = form;

  const okHandle = () => {
    form.validateFields((err, values) => {
      if (err) return;
      handleAdd(values, () => {
        form.resetFields();
      });
    });
  };

  return (
    <Modal
      destroyOnClose
      title="新建权限"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
      confirmLoading={loading}
    >
      <FormItem {...formItemLayout} label="权限标识" hasFeedback>
        {getFieldDecorator('name', {
          rules: [{ required: true, message: '请填写权限标识' }],
        })(<Input placeholder="请输入权限标识" disabled={loading} />)}
      </FormItem>
      <FormItem {...formItemLayout} label="权限名称" hasFeedback>
        {getFieldDecorator('display_name', {
          rules: [{ required: true, message: '请填写权限名称' }],
        })(<Input placeholder="请输入权限名称" disabled={loading} />)}
      </FormItem>
    </Modal>
  );
};

export default Form.create<CreateFormProps>()(CreateForm);
