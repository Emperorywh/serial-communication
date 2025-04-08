import { Button, Modal, notification } from 'antd';
import React, { useRef, useState } from 'react';

function App() {

  // 电子秤相关
  const renderRef = useRef<any>(null);
  const timer = useRef<any>(null);

  const [value, setValue] = useState(0)

  /**
   * 处理电子秤数据

  /**
    * 连接电子秤
    */
  const onConnect = async () => {
    const serialJsonData = {
      baudRate: 115200,
      dataBits: 8,
      flowControl: 'none',
      parity: 'none',
      stopBits: 1
    }

    if ((navigator as any)?.serial) {
      Modal.confirm({
        title: '提示',
        content: '是否连接电子秤',
        onOk: async () => {
          const port = await (navigator as any).serial.requestPort();
          await port.open(serialJsonData);
          // 创建一个读取器
          renderRef.current = port.readable.getReader();
          readData();
        }
      })
    } else {
      notification['info']({
        message: '提示',
        description:
          '当前浏览器协议不支持连接电子秤，请使用谷歌浏览器！',
      });
    }
  }

  const readData = async () => {
    // 读取一块数据
    const { value, done } = await renderRef.current.read();
    // 当串口关闭或者出现错误时，done会为true
    if (done) {
      renderRef.current.releaseLock();
    }
    // 在这里处理接收到的数据
    handleDeal(value);
    timer.current = setTimeout(readData, 50);
  }

  /**
   * 处理电子秤串口参数
   * @param value 
   */
  const handleDeal = (value: any) => {
    try {
      const hx = Array.prototype.map.call(
        value,
        x => ('00' + x.toString(16)).slice(-2)
      ).join('');
      if (hx.length === 30 &&
        hx.substring(0, 2).toUpperCase() === 'AA' &&
        hx.substring(28, 30).toUpperCase() === '2F') {
        const hxWeight = hx.substring(10, 18);
        const unit = hx.substring(6, 8);
        const result = parseInt(hxWeight, 16);
        setValue(result);
        console.log("hxWeight:", result);
      }
      // const hx = Array.prototype.map.call(value, x => ('00' + x.toString(16)).slice(-2)).join('');
      // console.log("电子秤数据:", value)
      // console.log("hx:", hx);
      // const decoder = new TextDecoder('utf-8');
      // const stringStr = decoder.decode(value);
      // console.log("stringStr", stringStr);
    } catch (error) {
      console.log("串口数据处理失败：", error)
    }
  }

  return (
    <div className="App">
      <Button onClick={onConnect}>连接设备</Button>
      <h1>{value}</h1>
    </div>
  );
}

export default App;
