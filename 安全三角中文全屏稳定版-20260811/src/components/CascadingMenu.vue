<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type { CSSProperties } from 'vue'
import { ChevronRight, Funnel, Search } from '@lucide/vue'
import { rootItems } from '../menu-data'
import type { GuardVisual, MenuItem, MenuPanel, Point } from '../types'
import GuardOverlay from './GuardOverlay.vue'

interface GuardState {
  apex: Point
  state: 'tracking' | 'committed'
}

interface PendingActivation {
  depth: number
  item: MenuItem
  point: Point
}

const props = defineProps<{
  showGeometry: boolean
}>()

const emit = defineEmits<{
  status: [payload: { depth: number; guardCount: number; state: string }]
}>()

const stageRef = ref<HTMLElement | null>(null)
const isOpen = ref(true)
const initialPath = () => ['project-properties', 'project-labels']
const openPath = ref<string[]>(initialPath())
const guards = reactive(new Map<number, GuardState>())
const visualGuards = ref<GuardVisual[]>([])
const panelRefs = new Map<number, HTMLElement>()
const itemRefs = new Map<string, HTMLElement>()
const pointerHistory: Point[] = []
let pendingActivation: PendingActivation | null = null
let pendingTimer: number | undefined
let frameRequest: number | undefined
let lastPublishedStatus = ''

const panels = computed<MenuPanel[]>(() => {
  const result: MenuPanel[] = [{
    depth: 0,
    title: '筛选',
    items: rootItems,
    searchPlaceholder: '搜索全部…',
  }]
  let items = rootItems

  for (let depth = 0; depth < openPath.value.length; depth += 1) {
    const selected = items.find((item) => item.id === openPath.value[depth])
    if (!selected?.children) break

    result.push({
      depth: depth + 1,
      title: selected.label,
      items: selected.children,
      searchPlaceholder: `搜索${selected.label}…`,
    })
    items = selected.children
  }

  return result
})

const panelStyle = (depth: number): CSSProperties =>
  (() => {
    return {
      '--panel-offset': `${depth * 54}px`,
      '--panel-offset-compact': `${depth * 38}px`,
      zIndex: depth + 10,
    } as CSSProperties
  })()

const itemRefKey = (depth: number, id: string) => `${depth}:${id}`

const setPanelRef = (depth: number, element: Element | null) => {
  if (element instanceof HTMLElement) panelRefs.set(depth, element)
  else panelRefs.delete(depth)
}

const setItemRef = (depth: number, id: string, element: Element | null) => {
  const key = itemRefKey(depth, id)
  if (element instanceof HTMLElement) itemRefs.set(key, element)
  else itemRefs.delete(key)
}

const pointFromEvent = (event: PointerEvent): Point => ({ x: event.clientX, y: event.clientY })

const recordPointer = (point: Point) => {
  pointerHistory.push(point)
  if (pointerHistory.length > 6) pointerHistory.shift()
}

const scheduleVisualRefresh = () => {
  if (frameRequest !== undefined) return
  frameRequest = requestAnimationFrame(() => {
    frameRequest = undefined
    recomputeVisuals()
  })
}

const recomputeVisuals = () => {
  const stageRect = stageRef.value?.getBoundingClientRect()
  if (!stageRect || !isOpen.value) {
    visualGuards.value = []
    publishStatus()
    return
  }

  const nextVisuals: GuardVisual[] = []

  guards.forEach((guard, depth) => {
    const parent = panelRefs.get(depth)
    const child = panelRefs.get(depth + 1)
    if (!parent || !child) return

    const parentRect = parent.getBoundingClientRect()
    const childRect = child.getBoundingClientRect()
    const opensRight = childRect.left >= parentRect.left
    const baseX = (opensRight ? childRect.left - 7 : childRect.right + 7) - stageRect.left

    nextVisuals.push({
      depth,
      state: guard.state,
      apex: {
        x: guard.apex.x - stageRect.left,
        y: guard.apex.y - stageRect.top,
      },
      top: { x: baseX, y: childRect.top - stageRect.top + 9 },
      bottom: { x: baseX, y: childRect.bottom - stageRect.top - 9 },
    })
  })

  visualGuards.value = nextVisuals.sort((a, b) => a.depth - b.depth)
  publishStatus()
}

const publishStatus = () => {
  const activeGuard = [...guards.values()].at(-1)
  const payload = {
    depth: panels.value.length,
    guardCount: guards.size,
    state: activeGuard?.state === 'committed' ? '路径已确认' : '正在追踪',
  }
  const signature = `${payload.depth}:${payload.guardCount}:${payload.state}`
  if (signature === lastPublishedStatus) return
  lastPublishedStatus = signature
  emit('status', payload)
}

const clearPending = (fromDepth = 0) => {
  if (pendingActivation && pendingActivation.depth >= fromDepth) pendingActivation = null
  if (pendingTimer !== undefined) {
    window.clearTimeout(pendingTimer)
    pendingTimer = undefined
  }
}

const removeGuardsFrom = (depth: number) => {
  for (const key of guards.keys()) {
    if (key >= depth) guards.delete(key)
  }
}

const fallbackApex = (depth: number, item: MenuItem): Point => {
  const element = itemRefs.get(itemRefKey(depth, item.id))
  const rect = element?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return { x: rect.right - 32, y: rect.top + rect.height / 2 }
}

const activateItem = async (depth: number, item: MenuItem, point?: Point) => {
  clearPending(depth)
  openPath.value = [...openPath.value.slice(0, depth), item.id]
  removeGuardsFrom(depth)

  if (item.children) {
    guards.set(depth, {
      apex: point ?? fallbackApex(depth, item),
      state: 'tracking',
    })
  }

  await nextTick()
  scheduleVisualRefresh()
}

const sign = (first: Point, second: Point, third: Point) =>
  (first.x - third.x) * (second.y - third.y) -
  (second.x - third.x) * (first.y - third.y)

const isPointInsideTriangle = (point: Point, triangle: GuardVisual) => {
  const d1 = sign(point, triangle.apex, triangle.top)
  const d2 = sign(point, triangle.top, triangle.bottom)
  const d3 = sign(point, triangle.bottom, triangle.apex)
  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0
  return !(hasNegative && hasPositive)
}

const isMovingTowardChild = (depth: number, point: Point) => {
  const childRect = panelRefs.get(depth + 1)?.getBoundingClientRect()
  const previous = pointerHistory.at(-4) ?? pointerHistory.at(0)
  if (!childRect || !previous) return false

  const target = {
    x: childRect.left,
    y: Math.min(childRect.bottom, Math.max(childRect.top, point.y)),
  }
  const previousDistance = Math.hypot(previous.x - target.x, previous.y - target.y)
  const currentDistance = Math.hypot(point.x - target.x, point.y - target.y)
  const horizontalIntent = childRect.left >= point.x ? point.x >= previous.x : point.x <= previous.x

  return horizontalIntent && currentDistance < previousDistance - 1
}

const isProtectedMove = (depth: number, point: Point) => {
  const triangle = visualGuards.value.find((visual) => visual.depth === depth)
  return Boolean(
    triangle && isPointInsideTriangle(point, triangle) && isMovingTowardChild(depth, point),
  )
}

const scheduleActivation = (depth: number, item: MenuItem, point: Point) => {
  clearPending(depth)
  pendingActivation = { depth, item, point }
  pendingTimer = window.setTimeout(() => {
    const pending = pendingActivation
    pendingActivation = null
    pendingTimer = undefined
    if (pending) void activateItem(pending.depth, pending.item, pending.point)
  }, 180)
}

const onItemEnter = (depth: number, item: MenuItem, event: PointerEvent) => {
  const point = pointFromEvent(event)
  recordPointer(point)
  const activeId = openPath.value[depth]
  if (activeId === item.id) return

  const currentPanel = panels.value[depth]
  const currentItem = currentPanel?.items.find((candidate) => candidate.id === activeId)
  if (currentItem?.children && guards.has(depth) && isProtectedMove(depth, point)) {
    scheduleActivation(depth, item, point)
    return
  }

  void activateItem(depth, item, point)
}

const onItemMove = (depth: number, item: MenuItem, event: PointerEvent) => {
  const point = pointFromEvent(event)
  recordPointer(point)

  if (openPath.value[depth] === item.id && item.children) {
    const guard = guards.get(depth)
    if (guard) {
      guard.apex = point
      guard.state = 'tracking'
      scheduleVisualRefresh()
    }
  }

  if (
    pendingActivation?.depth === depth &&
    pendingActivation.item.id === item.id &&
    !isProtectedMove(depth, point)
  ) {
    const pending = pendingActivation
    clearPending(depth)
    void activateItem(depth, pending.item, point)
  }
}

const onPanelEnter = (depth: number) => {
  if (depth === 0) return
  clearPending(depth - 1)
  const parentGuard = guards.get(depth - 1)
  if (parentGuard) {
    parentGuard.state = 'committed'
    scheduleVisualRefresh()
  }
}

const onFocusItem = (depth: number, item: MenuItem) => {
  if (openPath.value[depth] !== item.id) void activateItem(depth, item)
}

const onItemKeydown = async (depth: number, item: MenuItem, event: KeyboardEvent) => {
  if (event.key === 'ArrowRight' && item.children) {
    event.preventDefault()
    await activateItem(depth, item)
    await nextTick()
    panelRefs.get(depth + 1)?.querySelector<HTMLElement>('.menu-item')?.focus()
  }

  if (event.key === 'ArrowLeft' && depth > 0) {
    event.preventDefault()
    const parentId = openPath.value[depth - 1]
    itemRefs.get(itemRefKey(depth - 1, parentId))?.focus()
  }
}

const reset = async () => {
  clearPending()
  openPath.value = initialPath()
  guards.clear()
  lastPublishedStatus = ''
  await nextTick()
  const projectProperties = rootItems.find((item) => item.id === 'project-properties')
    ?? rootItems[0]
  const projectLabels = projectProperties.children?.find((item) => item.id === 'project-labels')
    ?? projectProperties.children?.[0]
  guards.set(0, { apex: fallbackApex(0, projectProperties), state: 'committed' })
  if (projectLabels) {
    guards.set(1, { apex: fallbackApex(1, projectLabels), state: 'tracking' })
  }
  scheduleVisualRefresh()
}

const toggleOpen = async () => {
  isOpen.value = !isOpen.value
  clearPending()
  await nextTick()
  if (isOpen.value && guards.size === 0) await reset()
  scheduleVisualRefresh()
}

const handleResize = () => scheduleVisualRefresh()

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await nextTick()
  await reset()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  clearPending()
  if (frameRequest !== undefined) cancelAnimationFrame(frameRequest)
})

defineExpose({ reset })
</script>

<template>
  <div ref="stageRef" class="demo-stage" @scroll.passive="scheduleVisualRefresh">
    <div class="stage-toolbar">
      <button
        class="filter-trigger"
        type="button"
        :aria-expanded="isOpen"
        aria-controls="safe-menu-track"
        @click="toggleOpen"
      >
        <Funnel :size="17" :stroke-width="2" />
        筛选
      </button>

      <p class="stage-hint">
        斜向移动时保持当前子菜单
        <span aria-hidden="true">↗</span>
      </p>
    </div>

    <Transition name="menu-pop">
      <div
        v-if="isOpen"
        id="safe-menu-track"
        class="menu-track"
        @keydown.esc="toggleOpen"
      >
        <section
          v-for="panel in panels"
          :key="`${panel.depth}:${panel.title}`"
          :ref="(element) => setPanelRef(panel.depth, element as Element | null)"
          class="menu-panel menu-panel--classic"
          :style="panelStyle(panel.depth)"
          role="menu"
          :aria-label="panel.title"
          @pointerenter="onPanelEnter(panel.depth)"
        >
          <label v-if="panel.searchPlaceholder" class="menu-search">
            <Search :size="18" :stroke-width="1.8" aria-hidden="true" />
            <input :placeholder="panel.searchPlaceholder" :aria-label="panel.searchPlaceholder" />
          </label>

          <div class="menu-items menu-items--classic">
            <button
              v-for="item in panel.items"
              :key="item.id"
              :ref="(element) => setItemRef(panel.depth, item.id, element as Element | null)"
              class="menu-item"
              :class="{
                'menu-item--active': openPath[panel.depth] === item.id,
                'menu-item--plain': !item.icon && !item.avatar,
                'menu-item--danger': item.danger,
                'menu-item--divider': item.dividerBefore,
              }"
              type="button"
              role="menuitem"
              :aria-haspopup="item.children ? 'menu' : undefined"
              :aria-expanded="item.children ? openPath[panel.depth] === item.id : undefined"
              @pointerenter="onItemEnter(panel.depth, item, $event)"
              @pointermove="onItemMove(panel.depth, item, $event)"
              @focus="onFocusItem(panel.depth, item)"
              @keydown="onItemKeydown(panel.depth, item, $event)"
            >
              <span
                v-if="item.avatar"
                class="item-avatar"
                :style="{ '--avatar-color': item.color }"
              >
                {{ item.avatar }}
              </span>
              <component
                :is="item.icon"
                v-else-if="item.icon"
                class="item-icon"
                :style="{ color: item.color }"
                :size="19"
                :stroke-width="1.9"
                aria-hidden="true"
              />
              <span class="item-label">{{ item.label }}</span>
              <span class="item-tail">
                <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
                <ChevronRight
                  v-if="item.children"
                  class="item-chevron"
                  :size="16"
                  :stroke-width="2"
                  aria-hidden="true"
                />
              </span>
            </button>
          </div>
        </section>
      </div>
    </Transition>

    <GuardOverlay :guards="visualGuards" :visible="props.showGeometry && isOpen" />

    <button class="stage-reset" type="button" @click="reset">
      重置路径
    </button>
  </div>
</template>
