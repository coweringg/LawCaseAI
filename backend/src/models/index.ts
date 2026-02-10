import User from './User'
import CaseModel from './Case'
import CaseFileModel from './CaseFile'
import ChatMessageModel from './ChatMessage'

export {
  User,
  CaseModel,
  CaseFileModel,
  ChatMessageModel
}

export default {
  User,
  Case: CaseModel,
  CaseFile: CaseFileModel,
  ChatMessage: ChatMessageModel
}
