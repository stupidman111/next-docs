import { Extension } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType; //设置选中区域的行高。
      unsetLineHeight: () => ReturnType; // 重置行高为默认值。
    };
  }
}

export const LineHeightExtension = Extension.create({
  name: "lineHeight",
  //用于为 paragraph 和 heading 元素 添加行高 (lineHeight) 属性
  addOptions() {
    return {
      types: ["paragraph", "heading"], // 仅作用于段落和标题
      defaultLineHeight: "normal", // 默认行高
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            //负责将 lineHeight 转换成 HTML 内联样式
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
            //解析 HTML 时 提取已有的 line-height 样式，避免丢失已有内容的格式
            parseHTML: (element) => {
              return element.style.lineHeight || this.options.defaultLineHeight;
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      //设置选中区域的行高
      setLineHeight:
        (lineHeight: string) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state; //获取当前选区 (selection)。
          tr = tr.setSelection(selection);

          //遍历选区范围内的所有节点 (state.doc.nodesBetween(from, to))。
          const { from, to } = selection;
          state.doc.nodesBetween(from, to, (node, pos) => {
            //如果节点类型符合 paragraph 或 heading，修改其 lineHeight 属性。
            if (this.options.types.includes(node.type.name)) {
              //使用 tr.setNodeMarkup() 更新节点的 lineHeight 值。
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                lineHeight,
              });
            }
          });
          //触发 dispatch(tr) 让变更生效
          if (dispatch) dispatch(tr);
          return true;
        },

      //将行高恢复到默认值 "normal"
      unsetLineHeight:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          tr = tr.setSelection(selection);

          //遍历选区内的 paragraph 和 heading 节点。
          const { from, to } = selection;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              //将其 lineHeight 还原为 this.options.defaultLineHeight (默认为 "normal")。
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                lineHeight: this.options.defaultLineHeight,
              });
            }
          });
          //触发 dispatch(tr) 让变更生效。
          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },
});
