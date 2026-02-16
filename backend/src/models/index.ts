import User from './User'
import CaseModel from './Case'
import CaseFileModel from './CaseFile'
import ChatMessageModel from './ChatMessage'

export {
  User,
  CaseModel as Case,
  CaseFileModel as CaseFile,
  ChatMessageModel as ChatMessage
}

export default {
  User,
  Case: CaseModel,
  CaseFile: CaseFileModel,
  ChatMessage: ChatMessageModel
}
