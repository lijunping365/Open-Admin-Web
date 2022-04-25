import React, {useState } from 'react';
import {TreeSelect } from 'antd';

export interface TreeProps {
  onSelect: (parentId: number) => void;
  treeData: API.TreeData[];
  defaultValue: any[];
  defaultExpandedKeys: any[];
}

const ITreeSelect: React.FC<TreeProps> = (props) => {
  const [value, setValue] = useState(undefined);
  const { onSelect: handlerSelect, treeData, defaultValue, defaultExpandedKeys } = props;

  const onChange = (selectValue: any) => {
    setValue(selectValue);
    handlerSelect(selectValue);
  };

  const loop = (data: any) =>{
    return data.map((item: any) => {
      if (item.children) {
        return { title: item.name, key: item.id, children: loop(item.children) };
      }
      return {
        title: item.name,
        key: item.id,
      };
    });
  };

  return (
    <TreeSelect
      showSearch
      allowClear
      style={{ width: '100%' }}
      value={value}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      defaultValue={defaultValue}
      treeDefaultExpandedKeys={defaultExpandedKeys}
      treeData={loop(treeData)}
      placeholder="Please select"
      onChange={onChange}
    />
  );
};

export default ITreeSelect;
