
import Layout from "../components/Layout";
import { AppProvider } from "../contexts/AppContext";

const Index = () => {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
};

export default Index;
