/* @flow */

import {
  EditorState,
  RichUtils,
} from 'draft-js';
import {
  insertNewUnstyledBlock,
  removeSelectedBlocksStyle,
  addLineBreakRemovingSelection,
  isListBlock,
  changeDepth,
} from 'draftjs-utils';

/**
* Function will handle followind keyPress scenarios when Shift key is not pressed.
*/
function handleHardNewlineEvent(editorState: EditorState): EditorState {
  const selection = editorState.getSelection();
  if (selection.isCollapsed()) {
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    if (!isListBlock(block) &&
      block.getType() !== 'unstyled' &&
      block.getLength() === selection.getStartOffset()) {
      return insertNewUnstyledBlock(editorState);
    } else if (isListBlock(block) && block.getLength() === 0) {
      const depth = block.getDepth();
      if (depth === 0) {
        return removeSelectedBlocksStyle(editorState);
      } if (depth > 0) {
        return changeDepth(editorState, -1, depth);
      }
    }
  }
  return undefined;
}

/**
* The function will handle keypress 'Enter' in editor. Following are the scenarios:
*
* 1. Shift+Enter, Selection Collapsed -> line break will be inserted.
* 2. Shift+Enter, Selection not Collapsed ->
*      selected text will be removed and line break will be inserted.
* 3. Enter, Selection Collapsed ->
*      if current block is of type list and length of block is 0
*      a new list block of depth less that current one will be inserted.
* 4. Enter, Selection Collapsed ->
*      if current block not of type list, a new unstyled block will be inserted.
*/
export default function handleNewLine(editorState: EditorState, event: Object): EditorState {
  if (event.which === 13) {
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return RichUtils.insertSoftNewline(editorState);
    }
    return addLineBreakRemovingSelection(editorState);
  }
  return handleHardNewlineEvent(editorState);
}
