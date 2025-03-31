import "@tiptap/extension-text-style";
import { Extension } from "@tiptap/react";

/**
 * 作用：
 *  扩展 Tiptap 的命令类型定义，
 *  告诉 TypeScript 编辑器实例的 commands 对象中将存在 setFontSize 和 unsetFontSize 方法。
 *
 * 在 ts 代码中这段声明的必要性：
 *  如果不做此声明，调用 editor.commands.setFontSize() 时 TypeScript 会报错「方法不存在」。
 */
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSizeExtension = Extension.create({
  name: "fontSize", //扩展的唯一标识
  //定义扩展的配置选项，此处声明该扩展作用于 textStyle 类型的节点/标记。
  addOptions() {
    return { types: ["textStyle"] };
  },

  //定义如何将 fontSize 属性与 HTML 互相转换。
  addGlobalAttributes() {
    return [
      {
        types: this.options.types, // 即 ['textStyle']
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize, //当从 HTML 加载内容时，会读取元素的 style.fontSize 值并转换为编辑器中的 fontSize 属性。
            //当输出 HTML 时，会将 fontSize 属性转换为内联样式 style="font-size: ..."。
            renderHTML: (attributes) => {
              //仅当 fontSize 有值时才会渲染样式，避免空属性污染 HTML。
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      //为选中的文本设置字体大小。
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      //清除字体大小样式。
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
