import React, { useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartLine,
    faMoneyBillWave,
    faUserShield,
    faUserTie,
    faBuilding,
    faCheckSquare,
    faAddressBook,
    faChartPie,
    faUsers,
    faProjectDiagram,
    faFileContract,
    faFileInvoiceDollar,
    faUserCog,
    faNetworkWired,
    faLightbulb,
    faCog,
    faSignOutAlt,
    faTimes
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Badge, Image, Button, Dropdown, Accordion, Navbar } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import { Routes } from "../routes";
import ReactHero from "../assets/img/technologies/react-hero-logo.svg";
import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";
import { obtenerRoles } from "../services/authApi";

export default (props = {}) => {
    const location = useLocation();
    const { pathname } = location;
    const [show, setShow] = useState(false);
    const showClass = show ? "show" : "";

    const onCollapse = () => setShow(!show);

    const CollapsableNavItem = (props) => {
        const { eventKey, title, icon, children = null } = props;
        const defaultKey = pathname.indexOf(eventKey) !== -1 ? eventKey : "";

        return (
            <Accordion as={Nav.Item} defaultActiveKey={defaultKey}>
                <Accordion.Item eventKey={eventKey}>
                    <Accordion.Button as={Nav.Link} className="d-flex justify-content-between align-items-center">
                        <span>
                            <span className="sidebar-icon"><FontAwesomeIcon icon={icon} /> </span>
                            <span className="sidebar-text">{title}</span>
                        </span>
                    </Accordion.Button>
                    <Accordion.Body className="multi-level">
                        <Nav className="flex-column">
                            {children}
                        </Nav>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    };
    const rolesUsuario = obtenerRoles();

    const tieneAlgunRol = (...rolesPermitidos) =>
        rolesPermitidos.some((rol) => rolesUsuario.includes(rol));

    const NavItem = ({
        title,
        link,
        external = false,
        target,
        icon,
        image,
        badgeText,
        badgeBg = "secondary",
        badgeColor = "primary",
        rolesPermitidos = []
    }) => {
        if (
            rolesPermitidos.length > 0
            && !tieneAlgunRol(...rolesPermitidos)
        ) {
            return null;
        }

        const classNames = badgeText
            ? "d-flex justify-content-start align-items-center justify-content-between"
            : "";

        const navItemClassName = link === pathname ? "active" : "";

        const linkProps = external
            ? { href: link }
            : { as: Link, to: link };

        return (
            <Nav.Item
                className={navItemClassName}
                onClick={() => setShow(false)}
            >
                <Nav.Link
                    {...linkProps}
                    target={target}
                    className={classNames}
                >
                    <span>
                        {icon && (
                            <span className="sidebar-icon">
                                <FontAwesomeIcon icon={icon} />
                            </span>
                        )}

                        {image && (
                            <Image
                                src={image}
                                width={20}
                                height={20}
                                className="sidebar-icon svg-icon"
                            />
                        )}

                        <span className="sidebar-text">{title}</span>
                    </span>

                    {badgeText && (
                        <Badge
                            pill
                            bg={badgeBg}
                            text={badgeColor}
                            className="badge-md notification-count ms-2"
                        >
                            {badgeText}
                        </Badge>
                    )}
                </Nav.Link>
            </Nav.Item>
        );
    };

    return (
        <>
            <Navbar expand={false} collapseOnSelect variant="dark" className="navbar-theme-primary px-4 d-md-none">
                <Navbar.Brand className="me-lg-5" as={Link} to={Routes.DashboardOverview.path}>
                    <Image src={ReactHero} className="navbar-brand-light" />
                </Navbar.Brand>
                <Navbar.Toggle as={Button} aria-controls="main-navbar" onClick={onCollapse}>
                    <span className="navbar-toggler-icon" />
                </Navbar.Toggle>
            </Navbar>
            <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
                <SimpleBar className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}>
                    <div className="sidebar-inner px-4 pt-3">
                        <div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
                            <div className="d-flex align-items-center">
                                <div className="user-avatar lg-avatar me-4">
                                    <Image src={ProfilePicture} className="card-img-top rounded-circle border-white" />
                                </div>
                                <div className="d-block">
                                    <h6>Hi, Jane</h6>
                                    <Button as={Link} variant="secondary" size="xs" to={Routes.Signin.path} className="text-dark">
                                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Sign Out
                                    </Button>
                                </div>
                            </div>
                            <Nav.Link className="collapse-close d-md-none" onClick={onCollapse}>
                                <FontAwesomeIcon icon={faTimes} />
                            </Nav.Link>
                        </div>
                        <Nav className="flex-column pt-3 pt-md-0">
                            <NavItem
                                title="Nexus Safe-Cloud ERP"
                                link={Routes.DashboardOverview.path}
                                image={ReactHero}
                            />

                            <NavItem
                                title="Dashboard"
                                link={Routes.DashboardOverview.path}
                                icon={faChartPie}
                            />

                            <NavItem
                                title="Reports"
                                link={Routes.Reportes.path}
                                icon={faChartLine}
                                rolesPermitidos={[
                                    "ADMINISTRADOR",
                                    "FACTURACION",
                                    "GESTOR_PROYECTOS"
                                ]}
                            />

                            <NavItem
                                title="Users"
                                link={Routes.Usuarios.path}
                                icon={faUserCog}
                                rolesPermitidos={["ADMINISTRADOR"]}
                            />

                            <NavItem
                                title="Roles"
                                link={Routes.Roles.path}
                                icon={faUserShield}
                                rolesPermitidos={["ADMINISTRADOR"]}
                            />

                            <Dropdown.Divider className="my-3 border-indigo" />

                            <NavItem
                                title="Clients"
                                link={Routes.Clientes.path}
                                icon={faUsers}
                                rolesPermitidos={["ADMINISTRADOR", "GESTOR_PROYECTOS"]}
                            />

                            <NavItem
                                title="Client Contacts"
                                link={Routes.ContactosClientes.path}
                                icon={faAddressBook}
                                rolesPermitidos={["ADMINISTRADOR", "GESTOR_PROYECTOS"]}
                            />

                            <NavItem
                                title="Projects"
                                link={Routes.Proyectos.path}
                                icon={faProjectDiagram}
                                rolesPermitidos={["ADMINISTRADOR", "GESTOR_PROYECTOS"]}
                            />

                            <NavItem
                                title="Tasks"
                                link={Routes.Tareas.path}
                                icon={faCheckSquare}
                                rolesPermitidos={["ADMINISTRADOR", "GESTOR_PROYECTOS"]}
                            />

                            <NavItem
                                title="Contracts"
                                link={Routes.Contratos.path}
                                icon={faFileContract}
                                rolesPermitidos={["ADMINISTRADOR", "GESTOR_PROYECTOS"]}
                            />

                            <NavItem
                                title="Billing"
                                link={Routes.Facturas.path}
                                icon={faFileInvoiceDollar}
                                rolesPermitidos={["ADMINISTRADOR", "FACTURACION"]}
                            />

                            <NavItem
                                title="Payments"
                                link={Routes.Pagos.path}
                                icon={faMoneyBillWave}
                                rolesPermitidos={["ADMINISTRADOR", "FACTURACION"]}
                            />

                            <NavItem
                                title="Products and Services"
                                link={Routes.ProductosServicios.path}
                                icon={faNetworkWired}
                                rolesPermitidos={["ADMINISTRADOR", "FACTURACION"]}
                            />

                            <NavItem
                                title="Resources"
                                link={Routes.Recursos.path}
                                icon={faUserCog}
                                rolesPermitidos={["ADMINISTRADOR", "GESTOR_PROYECTOS"]}
                            />

                            <NavItem
                                title="Branches"
                                link={Routes.Sedes.path}
                                icon={faBuilding}
                                rolesPermitidos={["ADMINISTRADOR"]}
                            />

                            <NavItem
                                title="Employees"
                                link={Routes.Empleados.path}
                                icon={faUserTie}
                                rolesPermitidos={["ADMINISTRADOR"]}
                            />
                            <NavItem
                                title="Infrastructure"
                                link={Routes.Infraestructura.path}
                                icon={faNetworkWired}
                                rolesPermitidos={["ADMINISTRADOR"]}
                            />

                            <NavItem
                                title="Recommendations"
                                link={Routes.Recomendaciones.path}
                                icon={faLightbulb}
                                badgeText="AI"
                                badgeBg="secondary"
                                badgeColor="primary"
                                rolesPermitidos={["ADMINISTRADOR", "COMERCIAL"]}
                            />

                            <Dropdown.Divider className="my-3 border-indigo" />

                            <NavItem
                                title="Administration"
                                link={Routes.Administracion.path}
                                icon={faCog}
                                rolesPermitidos={["ADMINISTRADOR"]}
                            />
                        </Nav>
                    </div>
                </SimpleBar>
            </CSSTransition>
        </>
    );
};
