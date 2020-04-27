import { Author } from '../models/Author.testhelpers'

const williamShakespeare = new Author({
  firstName: 'William',
  lastName: 'Shakespeare',
  emailAddress: 'william@shakespeare.com',
  phoneNumber: '+1234567890',
})

williamShakespeare.nickName = 'Bill'
williamShakespeare.someUnsavedProperty = "Won't get saved!"

export { williamShakespeare }
