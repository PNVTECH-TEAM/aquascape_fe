import React from "react";
import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="px-6 py-10">

      <section className="text-center mb-16 mt-20">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">
          Aqua Forest
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Design your dream aquarium in 3D. Explore intelligent fish
          suggestions and manage your underwater world with ease.
        </p>

        <Button
          type="primary"
          size="large"
          className="px-8"
          onClick={() => navigate("/aquaIntro")}
        >
          Get Started
        </Button>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card
          hoverable
          className="rounded-2xl shadow-md cursor-pointer"
          onClick={() => navigate("/aquarium3d")}
        >
          <h3 className="text-lg font-semibold mb-2">
            3D Aquarium Design
          </h3>
          <p className="text-gray-500">
            Drag and drop elements to build your custom aquarium layout.
          </p>
        </Card>

        <Card
          hoverable
          className="rounded-2xl shadow-md"
        >
          <h3 className="text-lg font-semibold mb-2">
            Smart Fish Suggestion
          </h3>
          <p className="text-gray-500">
            AI-powered suggestions based on tank size and style.
          </p>
        </Card>

        <Card
          hoverable
          className="rounded-2xl shadow-md"
        >
          <h3 className="text-lg font-semibold mb-2">
            Online Shop
          </h3>
          <p className="text-gray-500">
            Automatically generate materials and connect to trusted stores.
          </p>
        </Card>
      </section>

    </div>
  );
};

export default HomePage;