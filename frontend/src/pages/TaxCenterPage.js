import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Progress } from '../components/ui/progress';
import {
  DollarSign, Plus, Trash2, Download, AlertTriangle,
  Calculator, Calendar, TrendingUp, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DEDUCTION_CATEGORIES = [
  'Mileage',
  'Phone',
  'Home Office',
  'Equipment',
  'Platform Fees',
  'Professional Development',
  'Software',
  'Other'
];

export default function TaxCenterPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [entryType, setEntryType] = useState('income');
  const [newEntry, setNewEntry] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'income'
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tax/summary`, {
        withCredentials: true
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Fetch tax summary error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!newEntry.amount || !newEntry.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/tax/entry`, {
        ...newEntry,
        amount: parseFloat(newEntry.amount),
        category: entryType
      }, { withCredentials: true });

      toast.success('Entry added');
      setShowAddForm(false);
      setNewEntry({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: 'income'
      });
      fetchSummary();
    } catch (error) {
      toast.error('Failed to add entry');
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      await axios.delete(`${API_URL}/api/tax/entry/${entryId}`, {
        withCredentials: true
      });
      toast.success('Entry deleted');
      fetchSummary();
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const exportData = () => {
    if (!summary) return;

    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount'].join(','),
      ...summary.entries.map(e => [
        e.date,
        e.category,
        `"${e.description}"`,
        e.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connectclub-tax-${new Date().getFullYear()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </Layout>
    );
  }

  const incomeEntries = summary?.entries?.filter(e => e.category === 'income') || [];
  const deductionEntries = summary?.entries?.filter(e => e.category === 'deduction') || [];

  return (
    <Layout>
      <div className="space-y-6" data-testid="tax-center">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-medium tracking-tight">Tax Center</h1>
            <p className="text-muted-foreground mt-1">Track your 1099 income and deductions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData} data-testid="export-csv">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={() => setShowAddForm(true)} data-testid="add-entry-btn">
              <Plus className="w-4 h-4 mr-2" /> Add Entry
            </Button>
          </div>
        </div>

        {/* 1099 Warning */}
        <div className="tax-callout tax-callout-warning" data-testid="tax-warning">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">You are likely a 1099 worker</p>
              <p className="text-sm mt-1">
                No withholding happens automatically. Set aside approximately 25-30% of every payment for self-employment taxes.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="dashboard-card" data-testid="gross-income-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-muted-foreground">Gross Income</span>
            </div>
            <div className="commission-amount text-2xl">${(summary?.gross_income || 0).toLocaleString()}</div>
          </div>

          <div className="dashboard-card" data-testid="deductions-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">Deductions</span>
            </div>
            <div className="commission-amount text-2xl">-${(summary?.total_deductions || 0).toLocaleString()}</div>
          </div>

          <div className="dashboard-card" data-testid="tax-estimate-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-muted-foreground">Est. SE Tax (15.3%)</span>
            </div>
            <div className="commission-amount text-2xl text-amber-600">
              ${(summary?.estimated_se_tax || 0).toLocaleString()}
            </div>
          </div>

          <div className="dashboard-card" data-testid="quarterly-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Quarterly Set-Aside</span>
            </div>
            <div className="commission-amount text-2xl">${(summary?.quarterly_set_aside || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">~${(summary?.weekly_set_aside || 0).toFixed(0)}/week</p>
          </div>
        </div>

        {/* Next Due Date */}
        <div className="tax-callout tax-callout-info" data-testid="due-date-callout">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Next Quarterly Payment</p>
              <p className="text-sm mt-1">
                Due: <strong>{summary?.next_due_date}</strong> • Estimated amount: <strong>${(summary?.quarterly_set_aside || 0).toLocaleString()}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Deduction Impact */}
        {summary?.total_deductions > 0 && (
          <div className="tax-callout tax-callout-success" data-testid="deduction-impact">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">
                  You've logged <strong>${summary.total_deductions.toLocaleString()}</strong> in deductions this year.
                  That reduces your estimated tax bill by approximately <strong>${Math.round(summary.total_deductions * 0.153).toLocaleString()}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="dashboard-card" data-testid="add-entry-form">
            <h3 className="font-medium mb-4">Add Entry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={entryType} onValueChange={setEntryType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                    placeholder="0.00"
                    className="pl-10"
                    data-testid="entry-amount"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder={entryType === 'income' ? 'e.g., Commission payment' : 'e.g., Home office supplies'}
                  className="mt-2"
                  data-testid="entry-description"
                />
              </div>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className="mt-2"
                  data-testid="entry-date"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button onClick={addEntry} data-testid="save-entry">Save Entry</Button>
            </div>
          </div>
        )}

        {/* Entries Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income */}
          <div className="dashboard-card">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Income Entries
            </h3>
            {incomeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No income entries yet</p>
            ) : (
              <div className="space-y-2">
                {incomeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="commission-amount text-emerald-600">+${entry.amount}</span>
                      <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deductions */}
          <div className="dashboard-card">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Deduction Entries
            </h3>
            {deductionEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No deductions logged yet</p>
            ) : (
              <div className="space-y-2">
                {deductionEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="commission-amount text-blue-600">-${entry.amount}</span>
                      <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          ConnectClub's Tax Center provides estimates for planning purposes only. It is not tax advice.
          Consult a licensed tax professional for your specific situation.
        </p>
      </div>
    </Layout>
  );
}
