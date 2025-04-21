import React, { useRef, useState } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
  DocumentEditorComponent,
  DocumentEditor,
  WordExport,
  SfdtExport,
} from '@syncfusion/ej2-react-documenteditor';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import './WordEditor.css';
import { Button, message, Modal } from 'antd';
import axios from 'axios';
import { apiUtil } from '../../utils';

DocumentEditorContainerComponent.Inject(Toolbar)
DocumentEditor.Inject(WordExport, SfdtExport)

const WordEditor: React.FC = () => {
  let container = useRef<DocumentEditorContainerComponent>(null)
  const editorRef = useRef<DocumentEditorContainerComponent>(null)

  const [showDialog, setShowDialog] = useState(false);
  const [filename, setFilename] = useState('');
  const [author, setAuthor] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const pendingBlobRef = useRef<Blob | null>(null);


  // let documenteditor: DocumentEditorComponent

  const onDownload = () => {
    const editor = (editorRef.current as any)?.documentEditor;
    if (editor) {
      editor.save('sample', 'Docx'); // Tải file xuống
    }
  };

  const handleConfirmSave = async () => {
    setIsLoading(true)
    console.log("filename author", filename, author);

    const editor = (editorRef.current as any)?.documentEditor;

    if (!editor) {
      console.warn("⚠️ DocumentEditor is not ready.");
      setIsLoading(false)
      return;
    }

    try {
      // const blob: Blob = await editor.saveAsBlob("DOCX");
      // console.log("📄 Blob file output:", blob);
      // const filenameDocument = `${filename}.docx`;
      // const file = new File([blob], filenameDocument, { type: blob.type });

      const sfdt = editor.serialize();
      console.log(sfdt);
      const sfdtBlob = new Blob([sfdt], { type: 'application/json' });
      const file = new File([sfdtBlob],`${filename}.txt`, { type: 'application/json' });

      // Goi api upload file lên server
      const resp = await apiUtil.auth.uploadFileAsync(file);
      console.log("Upload response:", resp);

      if (resp.IsSuccess) {
        const data = {
          FileName: filename,
          Url: resp.Result?.Url,
          FullUrl: resp.Result?.FullUrl,
          author: author
        };

        // Gọi api insert vào db
        const isInsert = await apiUtil.auth.queryAsync('FileData_Insert', data);

        if (isInsert.IsSuccess) {
          setIsLoading(false)

          console.log("File inserted successfully");
        } else {
          setIsLoading(false)
          console.error("Failed to insert file data");
        }
      } else {
        setIsLoading(false)
        console.error("Upload was not successful");
      }
    } catch (err) {
      setIsLoading(false)
      console.error("Error during upload or insert:", err);
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <Button onClick={() => setShowDialog(true)}>Save as blob</Button>
      <Button onClick={onDownload}>Save doc</Button>
      <Modal title="Basic Modal" open={showDialog} onOk={handleConfirmSave} onCancel={() => setShowDialog(false)} confirmLoading={isLoading}>
        <div className="p-4 space-y-4">
          <div>
            <label className="block mb-1">File Name:</label>
            <input
              type="text"
              className="w-full border px-2 py-1 rounded"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Author:</label>
            <input
              type="text"
              className="w-full border px-2 py-1 rounded"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
        </div>
      </Modal>
      <DocumentEditorContainerComponent
        id="container"
        height="100%"
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        enableToolbar={true}
        ref={editorRef}
      >
        <Inject services={[Toolbar]} />
      </DocumentEditorContainerComponent>
    </div>
  );
};

export default WordEditor;