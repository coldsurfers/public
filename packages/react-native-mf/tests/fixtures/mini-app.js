// 더미 미니앱. shared 카탈로그에 있는 모듈만 문다 — 실제로 설치돼 있지 않아도
// 플러그인이 치환하므로 번들이 성공해야 한다. 그게 이 픽스처의 요점이다.
import { useState } from 'react'
import { View } from 'react-native'

export default function MiniApp() {
  return { useState, View }
}
