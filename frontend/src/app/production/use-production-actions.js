import { useState } from 'react';
import { productionApi } from '../../lib/production-api.js';

export default function useProductionActions(refresh, setToast) {
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState(null);
  const [editingBom, setEditingBom] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  async function submit(event, action, successMessage) {
    event.preventDefault(); const element = event.currentTarget; setSaving(true);
    try { await action(new FormData(element)); element.reset(); setToast({ kind: 'success', message: successMessage }); await refresh(false); return true; }
    catch (error) { setToast({ kind: 'error', message: error.message || 'Unable to save this entry.' }); return false; }
    finally { setSaving(false); }
  }
  async function runAction(action, successMessage) {
    try { await action(); setToast({ kind: 'success', message: successMessage }); await refresh(false); }
    catch (error) { setToast({ kind: 'error', message: error.message || 'The action could not be completed.' }); }
  }
  async function loadDetails(label, load) {
    setDetailLoading(true);
    try { setDetails({ label, data: await load() }); }
    catch (error) { setToast({ kind: 'error', message: error.message || 'Unable to load record details.' }); }
    finally { setDetailLoading(false); }
  }
  async function openBomEditor(bom) {
    setDetailLoading(true);
    try { setEditingBom(await productionApi.getBom(bom.id)); }
    catch (error) { setToast({ kind: 'error', message: error.message || 'Unable to load this product recipe.' }); }
    finally { setDetailLoading(false); }
  }
  async function saveBomEdit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await productionApi.updateBom(editingBom.id, { productName: String(form.get('productName')).trim(), standardRunMinutes: Number(form.get('standardRunMinutes')) });
      setEditingBom(null); setToast({ kind: 'success', message: 'Product recipe updated.' }); await refresh(false);
    } catch (error) { setToast({ kind: 'error', message: error.message || 'Unable to update the product recipe.' }); }
  }
  return { saving, details, setDetails, editingBom, setEditingBom, detailLoading, submit, runAction, loadDetails, openBomEditor, saveBomEdit };
}
