import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const WordEditor: React.FC = () => {
    const [value, setValue] = useState('');

    const modules = {
        toolbar: [
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean']
        ]
    };

    const formats = [
        'font', 'size', 'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'align', 'direction', 'indent',
        'list',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    return (
        <ReactQuill 
            theme="snow" 
            value={value} 
            onChange={setValue}
            modules={modules}
            formats={formats}
        />
    );
};

export default WordEditor;
