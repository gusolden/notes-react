import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '@notes/data';
import { Editor, NoteList, OnChangeEditor, Sidebar } from '@notes/components';
import styles from './note-page.module.less';
import cn from 'classnames';
import { Button, Col, Collapse, Input, Row, Typography } from 'antd';
import { IconX } from '@tabler/icons-react';

const { Text } = Typography;

const notes = [
  { id: 'note-1', title: 'Note 1', author: 'anonymous' },
  { id: 'note-2', title: 'Note 2', author: 'anonymous' },
  { id: 'note-3', title: 'Note 3', author: 'anonymous' },
  { id: 'note-4', title: 'Note 4', author: 'anonymous' },
];
const peekedNotes = [
  { id: 'note-1', title: 'Note 1', author: 'anonymous' },
  { id: 'note-4', title: 'Note 4', author: 'anonymous' },
];

export function NotePage() {
  const { noteId } = useParams();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState({ blocks: [] });

  useEffect(() => {
    if (noteId) {
      setTitle('');
      setContent({ blocks: [] });

      socket.on('noteCreated', (data) => {
        if (data.noteId === noteId) {
          setContent(data);
        }
      });
    }
  }, [noteId]);

  const handleEditorChange: OnChangeEditor = (api) => {
    if (noteId) {
      api.saver.save().then(async (outputData) => {
        socket.emit('createNote', { noteId, ...outputData });
      });
    }
  };

  return (
    <Row wrap={false} gutter={16} className={styles.container}>
      <Sidebar id="notes-list" title="List of notes" side="left">
        <NoteList notes={notes} peekedNotes={peekedNotes} />
      </Sidebar>
      <Col flex={1}>
        <Row className={styles.content}>
          <Col flex={1} className={styles.section}>
            {noteId ? (
              <>
                <Input
                  size="large"
                  placeholder="Note title"
                  variant="borderless"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Editor onChange={handleEditorChange} data={content} />
              </>
            ) : (
              <div className={styles.unselectedNoteMessage}>
                <p>Select a note beside</p>
              </div>
            )}
          </Col>
          <Col className={cn(styles.section, styles.tags)}>Tags</Col>
        </Row>
      </Col>
      <Sidebar id="notes-peek" title="Notes peek" side="right">
        <div className={styles.peekList}>
          <Collapse
            size="small"
            defaultActiveKey={peekedNotes.map((note) => note.id)}
            className={styles.peekCollapse}
            items={peekedNotes.map((note) => ({
              key: note.id,
              label: (
                <Row wrap={false} justify="space-between" align="middle">
                  <Text>{note.title}</Text>
                  <Button type="link" onClick={(e) => e.stopPropagation()}>
                    <IconX size={16} />
                  </Button>
                </Row>
              ),
              children: <Text>That is the mocked note content.</Text>,
              className: styles.peekCard,
            }))}
          />
        </div>
      </Sidebar>
    </Row>
  );
}

export default NotePage;