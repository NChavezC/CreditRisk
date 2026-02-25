import { useNavigate } from "react-router-dom";
import Button from "../ui/Button"; // adjust path if needed

function PageNotFound() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/");
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      {/* 404 Code */}
      <h1 className="text-6xl font-bold text-stone-800 mb-4">404</h1>

      {/* Message */}
      <h2 className="text-2xl font-semibold text-stone-700 mb-3">
        Page Not Found
      </h2>

      <p className="text-stone-500 max-w-md mb-8">
        The page you are trying to access does not exist or has been moved.
        Please return to the home page to continue exploring the project.
      </p>

      {/* Action */}
      <Button onClick={handleClick}>Return to Home</Button>
    </div>
  );
}

export default PageNotFound;
