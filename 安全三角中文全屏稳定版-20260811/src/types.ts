import type { Component } from 'vue'

export interface MenuItem {
  id: string
  label: string
  icon?: Component
  color?: string
  avatar?: string
  shortcut?: string
  danger?: boolean
  dividerBefore?: boolean
  children?: MenuItem[]
}

export interface Point {
  x: number
  y: number
}

export interface GuardVisual {
  depth: number
  state: 'tracking' | 'committed'
  apex: Point
  top: Point
  bottom: Point
}

export interface MenuPanel {
  depth: number
  title: string
  items: MenuItem[]
  searchPlaceholder?: string
}
