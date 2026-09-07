// 더미 미니앱. 기본 shared 목록에 있는 것만 문다 — 실제로 설치돼 있지 않아도 플러그인이
// 치환하므로 번들이 성공해야 한다. 그게 이 픽스처의 요점이다.
import { useState } from 'react'
import { jsx } from 'react/jsx-runtime'
import { View } from 'react-native'

export default function MiniApp() {
  return { useState, View, jsx }
}
