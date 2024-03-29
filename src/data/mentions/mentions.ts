import { API } from '@editorjs/editorjs';
import { TMention, TUser } from '@notes/types';
import { socket } from '../socket/socket';

const trigger = '@';

export const mentionsService = {
  init: (editor: API) => {
    editor.listeners.on(editor.ui.nodes.wrapper, 'keyup', (e) => {
      if ((e as KeyboardEvent).key === trigger) {
        const currentIdx = editor.blocks.getCurrentBlockIndex();
        const currentBlock = editor.blocks.getBlockByIndex(currentIdx);
        if (!currentBlock) {
          return;
        }
        let el;
        if (currentBlock.name === 'paragraph') {
          el = currentBlock.holder.querySelector('.ce-paragraph');
        } else if (currentBlock.name === 'list') {
          el = currentBlock.holder.querySelector('.cdx-nested-list__item-content');
        }

        const regex = new RegExp(`${trigger}$`);
        if (!el || !el.innerHTML.match(regex)) {
          return;
        }

        el.innerHTML = el.innerHTML.replace(regex, `<a rel="tag">${trigger}</a>`);
        const anchor = editor.ui.nodes.wrapper.querySelector('a[rel="tag"]:not([href])');
        editor.selection.expandToTag(anchor as HTMLElement);
      }
    });
  },

  getMentions: async (q?: string) => {
    if (!q) {
      return [];
    }

    const data: TMention[] = await socket.emitWithAck('findAllTags');
    const items = data
      .map((i) => ({
        id: i.uuid,
        name: i.name,
      }))
      .filter((user) => (q ? user.name.toLowerCase().startsWith(q.toLowerCase()) : true));

    if (items.length === 0) {
      return [{ id: '0', name: q }];
    }

    return items;
  },

  outputTemplate: (user: TUser) => {
    return `<a href="#${user.id}" rel="tag">${user.name}</a>`;
  },
};
