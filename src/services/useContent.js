import { useContext } from 'react'
import { ContentContext } from './ContentContext'

// { es, en, links, cv }
export const useContent = () => useContext(ContentContext)
