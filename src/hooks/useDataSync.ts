import { useEffect } from 'react'
import { useAppDispatch } from '../store/hooks'
import { loadEvidence, clearEvidence } from '../store/evidenceSlice'
import { loadFood, clearFood } from '../store/foodSlice'
import { loadWeight, clearWeight } from '../store/weightSlice'
import { loadBodySettings, resetBodySettings } from '../store/bodySettingsSlice'
import { loadQuests, loadCompletions, loadWeekCompletions, clearQuests } from '../store/questsSlice'
import { loadBodyDaily, resetBodyDaily } from '../store/bodyDailySlice'
import { loadMoney, clearMoney } from '../store/moneySlice'
import { loadKnowledge, clearKnowledge } from '../store/knowledgeSlice'
import { loadPlanItems, clearPlanner } from '../store/plannerSlice'
import { clearPhotos } from '../store/photosSlice'

export function useDataSync(userId: string | null) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!userId) {
      dispatch(clearEvidence())
      dispatch(clearFood())
      dispatch(clearWeight())
      dispatch(resetBodySettings())
      dispatch(clearQuests())
      dispatch(resetBodyDaily())
      dispatch(clearMoney())
      dispatch(clearKnowledge())
      dispatch(clearPlanner())
      dispatch(clearPhotos())
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    const monday = (() => {
      const d = new Date()
      d.setDate(d.getDate() - (d.getDay() + 6) % 7)
      return d.toISOString().slice(0, 10)
    })()
    dispatch(loadEvidence(userId))
    dispatch(loadFood(userId))
    dispatch(loadWeight(userId))
    dispatch(loadBodySettings(userId))
    dispatch(loadQuests(userId))
    dispatch(loadCompletions({ userId, date: today }))
    dispatch(loadWeekCompletions({ userId, from: monday, to: today }))
    dispatch(loadBodyDaily({ userId, date: today }))
    dispatch(loadMoney(userId))
    dispatch(loadKnowledge(userId))
    dispatch(loadPlanItems(userId))
  }, [userId, dispatch])
}
