import { useEffect } from 'react'
import { useContacts } from '../../hooks/useContacts'
import { useChat } from '../../hooks/useChat'
import ContactItem from './ContactItem'
import Loader from '../ui/Loader'

const ContactList = () => {
  const { contacts, loading, loadContacts } = useContacts()
  const { selectedContact, selectContact } = useChat()

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader />
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No contacts yet</p>
        <p className="text-sm">Search for users to start chatting</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {contacts.map((contact) => (
        <ContactItem
          key={contact.id}
          contact={contact}
          onClick={() => selectContact(contact.id)}
          isSelected={selectedContact?.id === contact.id}
        />
      ))}
    </div>
  )
}

export default ContactList
