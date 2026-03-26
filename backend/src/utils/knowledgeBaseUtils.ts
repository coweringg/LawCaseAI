import KnowledgeDocument from '../models/KnowledgeDocument'
import User from '../models/User'

export const getRelevantKnowledgeContext = async (userId: string, query: string): Promise<string> => {
    try {
        const user = await User.findById(userId)
        if (!user) return ''

        const searchTerms = query.split(' ').filter(word => word.length > 3)
        const searchQuery: any = {
            $or: [
                { assignedTo: 'all' }
            ]
        }

        if (user.organizationId) {
            searchQuery.$or.push({ assignedTo: user.organizationId })
        }

        if (searchTerms.length > 0) {
            searchQuery.$text = { $search: searchTerms.join(' ') }
        }

        const documents = await KnowledgeDocument.find(searchQuery)
            .sort({ score: { $meta: 'textScore' } })
            .limit(2)
            .select('name extractedText category')

        if (documents.length === 0) return ''

        let context = '\n--- PLATFORM LEGAL LIBRARY CONTEXT ---\n'
        context += 'The following documents are from the master knowledge base and should be prioritized for legal reference:\n\n'
        
        context += documents.map(doc => {
            return `Document: "${doc.name}" (${doc.category.toUpperCase()})\nContent: ${doc.extractedText?.substring(0, 3000)}...`
        }).join('\n\n')

        context += '\n------------------------------------------\n'
        return context
    } catch (error) {
        return ''
    }
}
