import { NextPage } from "next";
import { useEffect, useState } from "react";

const ETHSpace: NextPage = () => {
    //在对后端发起请求后，将response的内容保存在results中
    const [result, setResult] = useState("The search results will be shown here");
    //设置默认是在我们提供的数据集而不是公共数据集中查询
    const [qinPublic, setQinPublic] = useState(false);
    //获取目前提供的数据集选项
    const [options, setOptions] = useState<string[]>([]);
    //获取用户选择的数据集
    const [dataset, setDataset] = useState("");
    //获取用户搜索的prompt
    const [seaPrompt, setSeaPrompt] = useState("");
    //仅在组件挂载时执行一次获取数据集列表
    useEffect(() => {
        const data = fetchOptions();
        setOptions(data);
    });

    //从后端获取数据集列表
    const fetchOptions = () => {
        return ['eth-smart-contracts', 'eth-smart-contracts-sliced', "eth-smart-contracts-analysis"];
    };
    //获取search prompt与dataset名字后向后端发request
    const handleonClick =()=>{
        
    };
    return (
        <div className="grid lg:grid-cols-2 flex-grow">
            <div className="hero min-h-screen bg-base-200 bg-gradient-to-r from-green-500 to-blue-500">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold">ETH-SPACE</h1>
                        <p className="py-6">Bodhi AI Explorer</p>
                        <div className="form-control mb-6">
                            <label className="label cursor-pointer">
                                <span className="label-text text-2xl">Search in the Public Dataset</span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-accent"
                                    checked={qinPublic}
                                    onChange={() => {
                                        setQinPublic(!qinPublic);
                                    }}
                                />
                            </label>
                        </div>
                        <div className="join mb-6">
                            <div>
                                <div>
                                    <input
                                        style={{width: "300px"}}
                                        className="input input-bordered join-item"
                                        value={seaPrompt}
                                        onChange={(e) => {
                                            setSeaPrompt(e.target.value);
                                        }}
                                        placeholder="Enter your prompt to search" />
                                </div>
                            </div>
                            <div>
                                <div>
                                    {!qinPublic ? (
                                        <select
                                            className="select select-bordered join-item"
                                            onChange={(e) => {
                                                setDataset(e.target.value);
                                            }}>
                                            {
                                                options.map((option, index) => (
                                                    <option key={index} value={option}>{option}</option>
                                                ))
                                            }
                                        </select>
                                    ) : (
                                        <input
                                            className="input input-bordered join-item"
                                            value={dataset}
                                            onChange={(e) => {
                                                setDataset(e.target.value);
                                            }}
                                            placeholder="Pls input the public dataset name" />
                                    )}
                                </div>
                            </div>
                            <div className="indicator">
                                <button className="btn join-item" onClick={()=>{
                                    handleonClick();
                                }}>Search</button>
                            </div>
                        </div>
                        <div className="hero-content text-left">
                            <span className="text-sm">
                                <p><b>A search question example: </b></p>
                                <p>* Give me some function examples about NFT</p>
                                <p>* 0x73c7448760517E3E6e416b2c130E3c6dB2026A1d</p>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-green-500">
                <div className="mx-auto w-4/5 h-4/5 backdrop-blur-lg backdrop-filter p-10 m-10 rounded-lg opacity-80 shadow-md">
                    <h2 className="text-4xl font-bold mb-4">Search Results</h2>
                    <span className="text-2xl m-2">
                        {result}
                    </span>
                </div>

            </div>
        </div>
    )
};

export default ETHSpace;