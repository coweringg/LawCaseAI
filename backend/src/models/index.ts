import User from './User'
import CaseModel from './Case'
import CaseFileModel from './CaseFile'
import ChatMessageModel from './ChatMessage'
import EventModel from './Event'

export {
  User,
  CaseModel as Case,
  CaseFileModel as CaseFile,
  ChatMessageModel as ChatMessage,
  EventModel as Event
}

export default {
  User,
  Case: CaseModel,
  CaseFile: CaseFileModel,
  ChatMessage: ChatMessageModel,
  Event: EventModel
}
