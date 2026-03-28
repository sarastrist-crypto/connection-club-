import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import {
  Users, Upload, UserPlus, Shield, ShieldCheck,
  Search, Trash2, CreditCard, AlertCircle,
  CheckCircle2, Eye, Linkedin, Facebook, Instagram,
  FileSpreadsheet, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SOURCE_ICONS = {
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  csv: FileSpreadsheet,
  manual: UserPlus,
};

export default function NetworkPage() {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, opted_in: 0, verified: 0, flagged: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newContact, setNewContact] = useState({ name: '', business_name: '', industry: '', email: '', phone: '', source: 'manual' });
  const [csvProcessing, setCsvProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/network/contacts`, { withCredentials: true });
      setContacts(res.data.contacts || []);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error('Fetch contacts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const addContact = async () => {
    if (!newContact.name.trim()) { toast.error('Name is required'); return; }
    try {
      await axios.post(`${API_URL}/api/network/contacts`, newContact, { withCredentials: true });
      toast.success('Contact added');
      setNewContact({ name: '', business_name: '', industry: '', email: '', phone: '', source: 'manual' });
      setShowAddForm(false);
      fetchContacts();
    } catch (err) {
      toast.error('Failed to add contact');
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      const contacts = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols[0]) {
          contacts.push({
            name: cols[0] || '',
            business_name: cols[1] || '',
            industry: cols[2] || '',
            email: cols[3] || '',
            phone: cols[4] || '',
            source: 'csv'
          });
        }
      }
      if (contacts.length > 0) {
        await axios.post(`${API_URL}/api/network/contacts/bulk`, contacts, { withCredentials: true });
        toast.success(`${contacts.length} contacts imported from CSV`);
        fetchContacts();
      } else {
        toast.error('No valid contacts found in CSV');
      }
    } catch (err) {
      toast.error('Failed to process CSV');
    } finally {
      setCsvProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleOptIn = async (contactId, current) => {
    try {
      await axios.patch(`${API_URL}/api/network/contacts/${contactId}/opt-in`, { opted_in: !current }, { withCredentials: true });
      fetchContacts();
    } catch (err) {
      toast.error('Failed to update opt-in');
    }
  };

  const verifyContact = async (contactId) => {
    try {
      const res = await axios.patch(`${API_URL}/api/network/contacts/${contactId}/verify`, { verified: true }, { withCredentials: true });
      toast.success('Contact verified. Analyzing for CCP opportunities...');
      fetchContacts();
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const deleteContact = async (contactId) => {
    try {
      await axios.delete(`${API_URL}/api/network/contacts/${contactId}`, { withCredentials: true });
      toast.success('Contact removed');
      fetchContacts();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filteredContacts = contacts.filter(c => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.business_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus === 'opted-in' && !c.opted_in) return false;
    if (filterStatus === 'verified' && !c.verified) return false;
    if (filterStatus === 'flagged' && !c.ccp_flagged) return false;
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6"><Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="network-page">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-medium tracking-tight">My Network</h1>
          <p className="text-muted-foreground mt-1">Import your contacts, opt in individuals, and let ConnectClub identify merchant service opportunities</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="dashboard-card" data-testid="stat-total">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
              <span className="text-sm text-muted-foreground">Total Contacts</span>
            </div>
            <div className="text-3xl font-medium">{stats.total}</div>
          </div>
          <div className="dashboard-card" data-testid="stat-optin">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><Shield className="w-4 h-4 text-blue-600" /></div>
              <span className="text-sm text-muted-foreground">Opted In</span>
            </div>
            <div className="text-3xl font-medium text-blue-600">{stats.opted_in}</div>
          </div>
          <div className="dashboard-card" data-testid="stat-verified">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-emerald-600" /></div>
              <span className="text-sm text-muted-foreground">Verified</span>
            </div>
            <div className="text-3xl font-medium text-emerald-600">{stats.verified}</div>
          </div>
          <div className="dashboard-card" data-testid="stat-flagged">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center"><CreditCard className="w-4 h-4 text-amber-600" /></div>
              <span className="text-sm text-muted-foreground">CCP Flagged</span>
            </div>
            <div className="text-3xl font-medium text-amber-600">{stats.flagged}</div>
          </div>
        </div>

        {/* Import Actions */}
        <div className="dashboard-card" data-testid="import-section">
          <h2 className="text-xl font-medium mb-2">Import Contacts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bring in your network from any source. Once imported, opt in specific individuals for ConnectClub's AI to research and flag merchant service opportunities.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => setShowAddForm(!showAddForm)} data-testid="import-manual">
              <UserPlus className="w-5 h-5" />
              <span className="text-xs">Manual Entry</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => fileInputRef.current?.click()} disabled={csvProcessing} data-testid="import-csv">
              <FileSpreadsheet className="w-5 h-5" />
              <span className="text-xs">{csvProcessing ? 'Processing...' : 'CSV Upload'}</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 opacity-60" disabled data-testid="import-linkedin">
              <Linkedin className="w-5 h-5" /><span className="text-xs">LinkedIn</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 opacity-60" disabled data-testid="import-facebook">
              <Facebook className="w-5 h-5" /><span className="text-xs">Facebook</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 opacity-60" disabled data-testid="import-instagram">
              <Instagram className="w-5 h-5" /><span className="text-xs">Instagram</span>
            </Button>
          </div>

          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" data-testid="csv-file-input" />

          <p className="text-xs text-muted-foreground">CSV format: Name, Business Name, Industry, Email, Phone (header row required)</p>

          {/* Manual Entry Form */}
          {showAddForm && (
            <div className="mt-4 p-4 rounded-lg border border-border space-y-3" data-testid="add-contact-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Full Name *" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} data-testid="contact-name" />
                <Input placeholder="Business Name" value={newContact.business_name} onChange={e => setNewContact({...newContact, business_name: e.target.value})} data-testid="contact-business" />
                <Input placeholder="Industry (e.g., Restaurant, Retail, Salon)" value={newContact.industry} onChange={e => setNewContact({...newContact, industry: e.target.value})} data-testid="contact-industry" />
                <Input placeholder="Email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} data-testid="contact-email" />
                <Input placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} data-testid="contact-phone" />
              </div>
              <div className="flex gap-2">
                <Button onClick={addContact} data-testid="save-contact">Add Contact</Button>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>

        {/* Contact List */}
        <div className="dashboard-card" data-testid="contacts-list">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-medium">Your Contacts ({filteredContacts.length})</h2>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" data-testid="contact-search" />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                data-testid="contact-filter"
              >
                <option value="all">All</option>
                <option value="opted-in">Opted In</option>
                <option value="verified">Verified</option>
                <option value="flagged">CCP Flagged</option>
              </select>
            </div>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">
                {contacts.length === 0 ? 'Import your first contacts to get started' : 'No contacts match your filter'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContacts.map(contact => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  onToggleOptIn={() => toggleOptIn(contact.id, contact.opted_in)}
                  onVerify={() => verifyContact(contact.id)}
                  onDelete={() => deleteContact(contact.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ContactRow({ contact, onToggleOptIn, onVerify, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const SourceIcon = SOURCE_ICONS[contact.source] || UserPlus;

  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      contact.ccp_flagged ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20' :
      contact.verified ? 'border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10' :
      'border-border'
    }`} data-testid={`contact-${contact.id}`}>
      <div className="flex items-center gap-3">
        {/* Source icon */}
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <SourceIcon className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{contact.name}</span>
            {contact.ccp_flagged && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-medium">
                <CreditCard className="w-3 h-3" /> CCP Match
              </span>
            )}
            {contact.verified && !contact.ccp_flagged && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {[contact.business_name, contact.industry].filter(Boolean).join(' - ') || 'No business info'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!contact.opted_in ? (
            <Button size="sm" variant="outline" onClick={onToggleOptIn} data-testid={`opt-in-${contact.id}`}>
              <Shield className="w-3.5 h-3.5 mr-1" /> Opt In
            </Button>
          ) : !contact.verified ? (
            <>
              <Button size="sm" variant="outline" onClick={onToggleOptIn} className="text-blue-600" data-testid={`opt-out-${contact.id}`}>
                <Shield className="w-3.5 h-3.5 mr-1" /> Opted In
              </Button>
              <Button size="sm" onClick={onVerify} data-testid={`verify-${contact.id}`}>
                <Eye className="w-3.5 h-3.5 mr-1" /> Verify
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" className="text-emerald-600" disabled>
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
            </Button>
          )}
          {contact.ccp_flagged && (
            <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} data-testid={`expand-${contact.id}`}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
          <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete} data-testid={`delete-${contact.id}`}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* CCP Analysis Panel */}
      {expanded && contact.ccp_analysis && (
        <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-border" data-testid={`analysis-${contact.id}`}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-sm">CCP Opportunity Analysis</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              contact.ccp_analysis.match_probability === 'High' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-muted text-muted-foreground'
            }`}>{contact.ccp_analysis.match_probability} Probability</span>
          </div>
          {contact.ccp_analysis.service && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="p-2 rounded bg-background border border-border">
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="text-sm font-medium">{contact.ccp_analysis.service}</p>
              </div>
              <div className="p-2 rounded bg-background border border-border">
                <p className="text-xs text-muted-foreground">Est. Volume</p>
                <p className="text-sm font-medium">{contact.ccp_analysis.estimated_volume}</p>
              </div>
              <div className="p-2 rounded bg-background border border-border">
                <p className="text-xs text-muted-foreground">Potential Residual</p>
                <p className="text-sm font-medium text-emerald-600">{contact.ccp_analysis.potential_residual}</p>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{contact.ccp_analysis.rationale}</p>
          <p className="text-xs text-muted-foreground mt-2 italic">All closing and monthly figures are approximates based on current industry interchange rates.</p>
        </div>
      )}
    </div>
  );
}
