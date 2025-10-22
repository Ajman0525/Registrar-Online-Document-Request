import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import DashboardIcon from '../icons/DashboardIcon';
import DocumentsIcon from '../icons/DocumentsIcon';
import LogsIcon from '../icons/LogsIcon';



const navItems = [
    {name: 'Dashboard', path: '/admin/dashboard', icon: DashboardIcon},
    {name: 'Documents', path: '/admin/document', icon: DocumentsIcon},
    {name: 'Logs', path: '/admin/logs', icon: LogsIcon}
]

const Sidebar = () => {
    return (
        <aside className= "admin-sidebar">
            <div className = "sidebar-header">
            
                    <img src="/assets/MSUIITLogo.png" alt="MSUIIT Logo" className="brand-logo" />
                    <div className ="brand-name">
                        <p id = "online">Online</p>
                        <p>Document</p>
                        <p>Request</p>
                    </div>
            
                
            </div>

            <nav>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}

                            className ={({isActive}) =>
                                isActive ? 'nav-item active' : 'nav-item'
                            }
                        >
                            <item.icon  className = "nav-icon" />
                            {item.name}
                        </NavLink>
                ))}
            </nav>
        </aside>
    )

};

export default Sidebar;