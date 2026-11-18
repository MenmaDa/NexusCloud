import React, { useState, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "../routes";
import { estaAutenticado } from "../services/authApi";

// ==========================================
// MODO DE VISTA PREVIA - SOLO DESARROLLO
// ==========================================

// ==========================================
// PÁGINAS GENERALES
// ==========================================

import Upgrade from "./Upgrade";
import DashboardOverview from "./dashboard/DashboardOverview";
import Transactions from "./Transactions";
import Settings from "./Settings";
import BootstrapTables from "./tables/BootstrapTables";
import Signin from "./examples/Signin";
import Signup from "./examples/Signup";
import ForgotPassword from "./examples/ForgotPassword";
import ResetPassword from "./examples/ResetPassword";
import Lock from "./examples/Lock";
import NotFoundPage from "./examples/NotFound";
import ServerError from "./examples/ServerError";

// ==========================================
// DOCUMENTACIÓN
// ==========================================

import DocsOverview from "./documentation/DocsOverview";
import DocsDownload from "./documentation/DocsDownload";
import DocsQuickStart from "./documentation/DocsQuickStart";
import DocsLicense from "./documentation/DocsLicense";
import DocsFolderStructure from "./documentation/DocsFolderStructure";
import DocsBuild from "./documentation/DocsBuild";
import DocsChangelog from "./documentation/DocsChangelog";

// ==========================================
// COMPONENTES GENERALES
// ==========================================

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader";

import Accordion from "./components/Accordion";
import Alerts from "./components/Alerts";
import Badges from "./components/Badges";
import Breadcrumbs from "./components/Breadcrumbs";
import Buttons from "./components/Buttons";
import Forms from "./components/Forms";
import Modals from "./components/Modals";
import Navs from "./components/Navs";
import Navbars from "./components/Navbars";
import Pagination from "./components/Pagination";
import Popovers from "./components/Popovers";
import Progress from "./components/Progress";
import Tables from "./components/Tables";
import Tabs from "./components/Tabs";
import Tooltips from "./components/Tooltips";
import Toasts from "./components/Toasts";

// ==========================================
// MÓDULOS DEL ERP
// ==========================================

import {
  ResourcesPage,
  InfrastructurePage,
  AdministrationPage,
  RecommendationsPage,
} from "./erp/ErpModules";

import ProductsServicesPage from "./erp/ProductsServicesPage";
import ClientsPage from "./erp/ClientsPage";
import ContractsPage from "./erp/ContractsPage";
import ClientContactsPage from "./erp/ClientContactsPage";
import ProjectsPage from "./erp/ProjectsPage";
import TasksPage from "./erp/TasksPage";
import EmployeesPage from "./erp/EmployeesPage";
import BranchesPage from "./erp/BranchesPage";
import RolesPage from "./erp/RolesPage";
import UsersPage from "./erp/UsersPage";
import MyTasksPage from "./erp/MyTasksPage";
import NotificationsPage from "./erp/NotificationsPage";
import BillingPage from "./erp/BillingPage";
import PaymentsPage from "./erp/PaymentsPage";
import ReportsPage from "./erp/ReportsPage";

// ==========================================
// MODO VISTA PREVIA - SOLO DESARROLLO LOCAL
// ==========================================

const modoVistaPrevia =
  process.env.NODE_ENV === "development" &&
  process.env.REACT_APP_PREVIEW_MODE === "true";

// ==========================================
// RUTAS PÚBLICAS CON PRELOADER
// ==========================================

const RouteWithLoader = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <Preloader show={!loaded} />
          <Component {...props} />
        </>
      )}
    />
  );
};

// ==========================================
// RUTAS CON SIDEBAR Y AUTENTICACIÓN
// ==========================================

const RouteWithSidebar = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);

    return () => clearTimeout(timer);
  }, []);

  const localStorageIsSettingsVisible = () => {
    return localStorage.getItem("settingsVisible") === "false" ? false : true;
  };

  const [showSettings, setShowSettings] = useState(
    localStorageIsSettingsVisible,
  );

  const toggleSettings = () => {
    setShowSettings(!showSettings);

    localStorage.setItem("settingsVisible", !showSettings);
  };

  return (
    <Route
      {...rest}
      render={(props) => {
        // ==================================
        // VALIDACIÓN DE ACCESO
        // ==================================

        // La vista previa permite mostrar
        // las pantallas sin sesión JWT.
        // Solo funciona en desarrollo.
        //
        // El backend mantiene su seguridad
        // y sus endpoints protegidos.

        if (!modoVistaPrevia && !estaAutenticado()) {
          return <Redirect to={Routes.Signin.path} />;
        }

        return (
          <>
            <Preloader show={!loaded} />

            <Sidebar />

            <main className="content">
              <Navbar />

              <Component {...props} />

              <Footer
                toggleSettings={toggleSettings}
                showSettings={showSettings}
              />
            </main>
          </>
        );
      }}
    />
  );
};

// ==========================================
// ENRUTADOR PRINCIPAL
// ==========================================

export default () => (
  <Switch>
    {/* ==================================
        RUTA PRINCIPAL
       ================================== */}

    <Route
      exact
      path={Routes.Presentation.path}
      render={() => (
        <Redirect
          to={
            modoVistaPrevia || estaAutenticado()
              ? Routes.DashboardOverview.path
              : Routes.Signin.path
          }
        />
      )}
    />

    {/* ==================================
        PÁGINAS PÚBLICAS
       ================================== */}

    <RouteWithLoader exact path={Routes.Signin.path} component={Signin} />

    <RouteWithLoader exact path={Routes.Signup.path} component={Signup} />

    <RouteWithLoader
      exact
      path={Routes.ForgotPassword.path}
      component={ForgotPassword}
    />

    <RouteWithLoader
      exact
      path={Routes.ResetPassword.path}
      component={ResetPassword}
    />

    <RouteWithLoader exact path={Routes.Lock.path} component={Lock} />

    <RouteWithLoader
      exact
      path={Routes.NotFound.path}
      component={NotFoundPage}
    />

    <RouteWithLoader
      exact
      path={Routes.ServerError.path}
      component={ServerError}
    />

    {/* ==================================
        ADMINISTRACIÓN DE USUARIOS
       ================================== */}

    <RouteWithSidebar exact path={Routes.Roles.path} component={RolesPage} />

    <RouteWithSidebar exact path={Routes.Usuarios.path} component={UsersPage} />

    {/* ==================================
        DASHBOARD
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.DashboardOverview.path}
      component={DashboardOverview}
    />

    {/* ==================================
        REPORTES
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Reportes.path}
      component={ReportsPage}
    />

    {/* ==================================
        CLIENTES
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Clientes.path}
      component={ClientsPage}
    />

    <RouteWithSidebar
      exact
      path={Routes.ContactosClientes.path}
      component={ClientContactsPage}
    />

    {/* ==================================
        TAREAS Y NOTIFICACIONES
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.MisTareas.path}
      component={MyTasksPage}
    />

    <RouteWithSidebar
      exact
      path={Routes.Notificaciones.path}
      component={NotificationsPage}
    />

    {/* ==================================
        PROYECTOS
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Proyectos.path}
      component={ProjectsPage}
    />

    {/* ==================================
        CONTRATOS
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Contratos.path}
      component={ContractsPage}
    />

    {/* ==================================
        TAREAS
       ================================== */}

    <RouteWithSidebar exact path={Routes.Tareas.path} component={TasksPage} />

    {/* ==================================
        FACTURACIÓN
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Facturas.path}
      component={BillingPage}
    />

    <RouteWithSidebar exact path={Routes.Pagos.path} component={PaymentsPage} />

    {/* ==================================
        PRODUCTOS Y SERVICIOS
        INCLUYE IMPORTACIÓN DE EXCEL
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.ProductosServicios.path}
      component={ProductsServicesPage}
    />

    {/* ==================================
        RECURSOS
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Recursos.path}
      component={ResourcesPage}
    />

    {/* ==================================
        EMPLEADOS
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Empleados.path}
      component={EmployeesPage}
    />

    {/* ==================================
        SEDES
       ================================== */}

    <RouteWithSidebar exact path={Routes.Sedes.path} component={BranchesPage} />

    {/* ==================================
        INFRAESTRUCTURA
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Infraestructura.path}
      component={InfrastructurePage}
    />

    {/* ==================================
        RECOMENDACIONES IA
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Recomendaciones.path}
      component={RecommendationsPage}
    />

    {/* ==================================
        ADMINISTRACIÓN
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Administracion.path}
      component={AdministrationPage}
    />

    {/* ==================================
        COMPONENTES DE LA PLANTILLA
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.Accordions.path}
      component={Accordion}
    />

    <RouteWithSidebar exact path={Routes.Alerts.path} component={Alerts} />

    <RouteWithSidebar exact path={Routes.Badges.path} component={Badges} />

    <RouteWithSidebar
      exact
      path={Routes.Breadcrumbs.path}
      component={Breadcrumbs}
    />

    <RouteWithSidebar exact path={Routes.Buttons.path} component={Buttons} />

    <RouteWithSidebar exact path={Routes.Forms.path} component={Forms} />

    <RouteWithSidebar exact path={Routes.Modals.path} component={Modals} />

    <RouteWithSidebar exact path={Routes.Navs.path} component={Navs} />

    <RouteWithSidebar exact path={Routes.Navbars.path} component={Navbars} />

    <RouteWithSidebar
      exact
      path={Routes.Pagination.path}
      component={Pagination}
    />

    <RouteWithSidebar exact path={Routes.Popovers.path} component={Popovers} />

    <RouteWithSidebar exact path={Routes.Progress.path} component={Progress} />

    <RouteWithSidebar exact path={Routes.Tables.path} component={Tables} />

    <RouteWithSidebar exact path={Routes.Tabs.path} component={Tabs} />

    <RouteWithSidebar exact path={Routes.Tooltips.path} component={Tooltips} />

    <RouteWithSidebar exact path={Routes.Toasts.path} component={Toasts} />

    {/* ==================================
        DOCUMENTACIÓN
       ================================== */}

    <RouteWithSidebar
      exact
      path={Routes.DocsOverview.path}
      component={DocsOverview}
    />

    <RouteWithSidebar
      exact
      path={Routes.DocsDownload.path}
      component={DocsDownload}
    />

    <RouteWithSidebar
      exact
      path={Routes.DocsQuickStart.path}
      component={DocsQuickStart}
    />

    <RouteWithSidebar
      exact
      path={Routes.DocsLicense.path}
      component={DocsLicense}
    />

    <RouteWithSidebar
      exact
      path={Routes.DocsFolderStructure.path}
      component={DocsFolderStructure}
    />

    <RouteWithSidebar
      exact
      path={Routes.DocsBuild.path}
      component={DocsBuild}
    />

    <RouteWithSidebar
      exact
      path={Routes.DocsChangelog.path}
      component={DocsChangelog}
    />

    {/* ==================================
        RUTA NO ENCONTRADA
       ================================== */}

    <Redirect to={Routes.NotFound.path} />
  </Switch>
);
