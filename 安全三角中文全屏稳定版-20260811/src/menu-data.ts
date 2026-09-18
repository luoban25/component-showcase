import {
  Activity,
  Box,
  Bug,
  ChartNoAxesColumnIncreasing,
  CircleDashed,
  CircleUserRound,
  Code2,
  Database,
  Flag,
  Layers3,
  ListTodo,
  Minus,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Sparkles,
  Square,
  Tag,
  UserRound,
  Zap,
} from '@lucide/vue'
import type { MenuItem } from './types'

const labelItems: MenuItem[] = [
  { id: 'bug', label: '缺陷', icon: Bug, color: '#ff4b59' },
  { id: 'enhancement', label: '改进', icon: Sparkles, color: '#22c77a' },
  { id: 'task', label: '任务', icon: Square, color: '#4d86ff' },
  { id: 'urgent', label: '紧急', icon: Flag, color: '#f04b8d' },
  { id: 'low-priority', label: '低优先级', icon: Zap, color: '#79d71d' },
  { id: 'frontend', label: '前端', icon: Layers3, color: '#ff9e22' },
  { id: 'backend', label: '后端', icon: Code2, color: '#08b9c7' },
  { id: 'database', label: '数据库', icon: Database, color: '#8f49ff' },
]

const projectPropertyItems: MenuItem[] = [
  { id: 'project-status', label: '项目状态', icon: CircleDashed },
  { id: 'project-health', label: '项目健康度', icon: Activity },
  { id: 'project-priority', label: '项目优先级', icon: ChartNoAxesColumnIncreasing },
  { id: 'project-labels', label: '项目标签', icon: Tag, children: labelItems },
  { id: 'project-lead', label: '项目负责人', icon: UserRound },
]

const statusItems: MenuItem[] = [
  { id: 'backlog', label: '待办池', icon: CircleDashed, color: '#89908c' },
  { id: 'todo', label: '待处理', icon: ListTodo, color: '#68716d' },
  { id: 'in-progress', label: '进行中', icon: Activity, color: '#f0a229' },
  { id: 'done', label: '已完成', icon: Sparkles, color: '#4d86ff' },
  { id: 'canceled', label: '已取消', icon: Minus, color: '#a0a6a2' },
]

const priorityItems: MenuItem[] = [
  { id: 'urgent-priority', label: '紧急', icon: Zap, color: '#ff4b59' },
  { id: 'high-priority', label: '高', icon: SignalHigh, color: '#f39b25' },
  { id: 'medium-priority', label: '中', icon: SignalMedium, color: '#e6bd1f' },
  { id: 'low-priority-option', label: '低', icon: SignalLow, color: '#4ea1ed' },
  { id: 'no-priority', label: '无优先级', icon: Minus, color: '#9aa09d' },
]

export const rootItems: MenuItem[] = [
  { id: 'status', label: '状态', icon: CircleDashed, children: statusItems },
  { id: 'assignee', label: '负责人', icon: CircleUserRound },
  { id: 'priority', label: '优先级', icon: ChartNoAxesColumnIncreasing, children: priorityItems },
  { id: 'labels', label: '标签', icon: Tag, children: labelItems },
  { id: 'project-properties', label: '项目属性', icon: Box, children: projectPropertyItems },
]
