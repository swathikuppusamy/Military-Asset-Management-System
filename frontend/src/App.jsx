import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import AssetsList from './components/Assets/AssetsList';
import AssetForm from './components/Assets/AssetForm';
import TransfersList from './components/Transfers/TransfersList';
import TransferForm from './components/Transfers/TransferForm';
import TransferView from './components/Transfers/TransferView'; 
import PurchasesList from './components/Purchases/PurchasesList';
import PurchaseForm from './components/Purchases/PurchaseForm';
import PurchaseView from './components/Purchases/PurchaseView';
import AssignmentsList from './components/Assignments/AssignmentsList';
import AssignmentForm from './components/Assignments/AssignmentForm';
import AssignmentView from './components/Assignments/AssignmentView';
import ExpendituresList from './components/Expenditures/ExpendituresList'; 
import ExpenditureForm from './components/Expenditures/ExpenditureForm';
import ExpenditureViewPage from './components/Expenditures/ExpenditureViewPage';
import UsersList from './components/Users/UsersList';
import UserForm from './components/Users/UserForm';
import Settings from './components/Settings/Settings';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<AssetsList />} />
              <Route path="/assets/new" element={<AssetForm />} />
              <Route path="/assets/edit/:id" element={<AssetForm />} />
              <Route path="/transfers" element={<TransfersList />} />
              <Route path="/transfers/new" element={<TransferForm />} />
              <Route path="/transfers/view/:id" element={<TransferView />} />
              <Route path="/transfers/edit/:id" element={<TransferForm />} />
              <Route path="/purchases" element={<PurchasesList />} />
              <Route path="/purchases/new" element={<PurchaseForm />} />
              <Route path="/purchases/view/:id" element={<PurchaseView />} />
              <Route path="/assignments" element={<AssignmentsList />} />
              <Route path="/assignments/new" element={<AssignmentForm />} />
              <Route path="/assignments/edit/:id" element={<AssignmentForm />} />
              <Route path="/assignments/view/:id" element={<AssignmentView />} />
              <Route path="/expenditures" element={<ExpendituresList />} /> {/* Changed from Expenditures */}
              <Route path="/expenditures/new" element={<ExpenditureForm />} />
              <Route path="/expenditures/edit/:id" element={<ExpenditureForm />} />
              <Route path="/expenditures/view/:id" element={<ExpenditureViewPage />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/users/new" element={<UserForm />} />
              <Route path="/users/edit/:id" element={<UserForm />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/signup" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;