import React, { useState, useEffect, useRef } from 'react'
import { Link } from "react-router-dom";
import '@toast-ui/editor/dist/toastui-editor.css';
import firebase, {app2} from '../firebase';
import { Editor } from '@toast-ui/react-editor';
import { Button, Form, Input, Radio, Select, DatePicker, Checkbox, Spin } from 'antd';
import * as antIcon from "react-icons/ai";
import { getFormatDate } from './CommonFunc'
import uuid from "react-uuid";
import moment from 'moment';
import { useSelector } from "react-redux";
const { Option } = Select;
const { RangePicker } = DatePicker;

function Write() {
  
  const userInfo = useSelector((state) => state.user.currentUser);
  const editorRef = React.useRef();
  const btnToList = React.useRef();

  const [Type, setType] = useState("1")
  const onTypeChange = (e) => {
    const type = e.target.value;
    setType(type);
  }

  const [Loading, setLoading] = useState(false)
  const onsubmit = async (values) => {    
    setLoading(true)
    let d_regis = getFormatDate(new Date());
    if(values.project_date){
      let date = [];
      date.push(getFormatDate(values.project_date[0]._d));
      date.push(getFormatDate(values.project_date[1]._d));
      values.project_date = date;
    } 
    const uid = uuid();
    const getEditor = editorRef.current.getInstance();
    const getHtml = getEditor.getHTML();
    values.hidden = values.hidden ? true : false;
    values.secret = values.secret ? true : false;
    values.emergency = values.emergency ? true : false;
    values.type = Type; 
    const time = new Date().getTime();
    let number;

    await firebase.database(app2)
    .ref(`work_list_number`)
    .child("count")
    .transaction((pre) => {
      number = pre+1;
      return pre + 1;
    });

    await firebase.database(app2).ref(`work_list/${uid}`)
    .set({
      ...values,
      number:number,
      content:getHtml,
      og_content:getHtml,
      d_regis:d_regis,
      state:"0",
      uid:uid,
      name:userInfo.displayName,
      part:userInfo.photoURL,
      timestamp:time,
      user_uid:userInfo.uid
    })
    .then((data)=>{
      setLoading(false)
      btnToList.current && btnToList.current.click();
    })
  }
  return (
    <>
      <Form name="dynamic_form_nest_item" className="work-list-form" onFinish={onsubmit} autoComplete="off">
        <Form.Item
          name="title"
          rules={[{ required: true, message: '????????? ????????? ?????????.'}]}
        >
          <Input placeholder="??????" />
        </Form.Item>
        <div className="flex-box wrap">
          <Form.Item
            name="site"
            style={{width:"100%",maxWidth:"120px",marginRight:"10px"}}
            rules={[{ required: true, message: '?????????'}]}
          >
            <Select placeholder="???????????????">
              <Option value="?????????">?????????</Option>
              <Option value="????????? ?????????">????????? ?????????</Option>
              <Option value="?????????">?????????</Option>
              <Option value="????????? ?????????">????????? ?????????</Option>
              <Option value="?????????">?????????</Option>
              <Option value="??????">??????</Option>
              <Option value="??????">??????</Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="type"
            onChange={onTypeChange}
          >
            <Radio.Group defaultValue={Type} style={{marginRight:"10px"}}>
              {(userInfo && userInfo.role > 2 || userInfo && userInfo.auth && userInfo.auth === "it") &&
                <Radio.Button value="0">??????</Radio.Button >
              }
              <Radio.Button value="1">??????</Radio.Button >
              <Radio.Button value="2">????????????</Radio.Button >
            </Radio.Group>
          </Form.Item>
          <Form.Item 
            name="hidden" valuePropName="checked">
            <Checkbox>??????</Checkbox>
          </Form.Item>
          <Form.Item             
            name="secret" valuePropName="checked">
            <Checkbox>?????????(????????? ????????? IT????????? ??? ??? ????????????.)</Checkbox>
          </Form.Item>
        </div>
        {Type && Type === "1" && 
          <>
            <div className="flex-box">
              <Form.Item
                name="basic_type"
                style={{width:"100%",maxWidth:"120px",marginRight:"10px"}}
                rules={[{ required: true, message: '????????? ????????? ?????????.'}]}
              >
                <Select placeholder="????????????">
                  <Option value="1">??????</Option>
                  <Option value="2">??????/??????</Option>
                </Select>
              </Form.Item>
              <Form.Item 
                name="emergency" valuePropName="checked">
                <Checkbox>????????????</Checkbox>
              </Form.Item>
            </div>
          </>
        }

        {Type && Type === "2" && 
          <>
            <div className="flex-box">
              <Form.Item
                name="project_type"
                style={{marginRight:"5px"}}
                rules={[{ required: true, message: '????????? ????????? ?????????.'}]}
              >
                <Select placeholder="????????????">
                  <Option value="1">??????</Option>
                  <Option value="2">??????</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="project_date"
              >
                <RangePicker />
              </Form.Item>
            </div>
          </>
        }
        
        <Editor
          previewStyle="vertical"
          height="600px"
          initialEditType="wysiwyg"
          useCommandShortcut={true}
          ref={editorRef}
        />
        <div className="flex-box j-center" style={{margin:"20px 0"}}>
          <Button style={{marginRight:"5px"}}>
            <Link ref={btnToList} to="/"><antIcon.AiOutlineBars />????????????</Link>
          </Button>
          <Spin spinning={Loading}>
            <Button type="primary" htmlType="submit">??????</Button>
          </Spin>
        </div>
      </Form>
    </>
  )
}

export default Write
