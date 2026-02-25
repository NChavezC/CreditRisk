import { NavLink } from "react-router-dom";

function Header() {
  const linkBase =
    "px-3 py-2 text-sm font-medium transition-colors duration-200";

  const linkActive = "text-blue-600 border-b-2 border-blue-600";

  const linkInactive = "text-stone-600 hover:text-black";

  return (
    <header className="border-b border-stone-300">
      {/* Title Row */}
      <div className="py-4 px-6 flex justify-center items-center">
        <h1 className="text-3xl font-semibold">
          End-to-End Credit Risk Modeling
        </h1>
      </div>

      {/* Navigation Row */}
      <nav className="flex justify-center gap-6 pb-3">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/models"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          Models
        </NavLink>

        <NavLink
          to="/decisioning"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          Decisioning
        </NavLink>

        <NavLink
          to="/frontier"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          Risk–Return Frontier
        </NavLink>

        <NavLink
          to="/lgd"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          LGD Sensitivity
        </NavLink>

        <NavLink
          to="/robustness"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          Robustness
        </NavLink>

        <NavLink
          to="/notebooks"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          Notebooks
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          About
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
