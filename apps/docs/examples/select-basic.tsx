'use client'
import { Select } from '@coldsurfers/design-system/primitives'
import { useState } from 'react'

const CITIES = [
  { value: 'seoul', label: '서울' },
  { value: 'busan', label: '부산' },
  { value: 'daegu', label: '대구' },
]

export default function Example() {
  const [city, setCity] = useState('seoul')

  return <Select options={CITIES} value={city} onChange={setCity} aria-label="도시" />
}
