import React, { useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import AuthContext from "../AuthContext";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Helper function to format currency in PKR
const formatPKR = (amount) => {
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
};

function Dashboard() {
  const [saleAmount, setSaleAmount] = useState(0);
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [timePeriod, setTimePeriod] = useState('month');
  const [profit, setProfit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [{
      label: "Product Stock",
      data: [],
      backgroundColor: [
        "rgba(255, 99, 132, 0.7)",
        "rgba(54, 162, 235, 0.7)",
        "rgba(255, 206, 86, 0.7)",
        "rgba(75, 192, 192, 0.7)",
        "rgba(153, 102, 255, 0.7)",
        "rgba(255, 159, 64, 0.7)",
        "rgba(201, 203, 207, 0.7)",
        "rgba(255, 145, 164, 0.7)",
        "rgba(28, 200, 138, 0.7)",
        "rgba(90, 103, 216, 0.7)",
      ],
      borderColor: [
        "rgb(255, 99, 132)",
        "rgb(54, 162, 235)",
        "rgb(255, 206, 86)",
        "rgb(75, 192, 192)",
        "rgb(153, 102, 255)",
        "rgb(255, 159, 64)",
        "rgb(201, 203, 207)",
        "rgb(255, 145, 164)",
        "rgb(28, 200, 138)",
        "rgb(90, 103, 216)",
      ],
      borderWidth: 1,
    }]
  });

  const [chart, setChart] = useState({
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
      },
    },
    series: [
      {
        name: "Monthly Sales Amount",
        data: Array(12).fill(0),
      },
    ],
  });

  // Update Chart Data
  const updateChartData = (salesData) => {
    setChart({
      ...chart,
      series: [
        {
          name: "Monthly Sales Amount",
          data: salesData,
        },
      ],
    });
  };

  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchTotalSaleAmount(),
          fetchTotalPurchaseAmount(),
          fetchStoresData(),
          fetchProductsData(),
          fetchMonthlySalesData()
        ]);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timePeriod]);

  // Calculate profit whenever sale or purchase amounts change
  useEffect(() => {
    if (!isLoading) {
      const calculatedProfit = Number(saleAmount || 0) - Number(purchaseAmount || 0);
      setProfit(calculatedProfit);
    }
  }, [saleAmount, purchaseAmount, isLoading]);

  // Fetching total sales amount
  const fetchTotalSaleAmount = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/sales/get/${authContext.user}/totalsaleamount?period=${timePeriod}`
      );
      const data = await response.json();
      if (response.ok) {
        setSaleAmount(Number(data.totalSaleAmount || 0));
      } else {
        throw new Error(data.error || 'Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to fetch sales data');
    }
  };

  // Fetching total purchase amount
  const fetchTotalPurchaseAmount = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/purchase/get/${authContext.user}/totalpurchaseamount?period=${timePeriod}`
      );
      const data = await response.json();
      if (response.ok) {
        setPurchaseAmount(Number(data.totalPurchaseAmount || 0));
      } else {
        throw new Error(data.error || 'Failed to fetch purchase data');
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setError('Failed to fetch purchase data');
    }
  };

  // Fetching all stores data
  const fetchStoresData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/store/get/${authContext.user}`);
      const data = await response.json();
      if (response.ok) {
        setStores(data);
      } else {
        throw new Error(data.error || 'Failed to fetch stores data');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to fetch stores data');
    }
  };

  // Fetching Data of All Products
  const fetchProductsData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/product/get/${authContext.user}`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      } else {
        throw new Error(data.error || 'Failed to fetch products data');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products data');
    }
  };

  // Fetching Monthly Sales
  const fetchMonthlySalesData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/sales/getmonthly`);
      const data = await response.json();
      if (response.ok) {
        updateChartData(data.salesAmount);
      } else {
        throw new Error(data.error || 'Failed to fetch monthly sales data');
      }
    } catch (error) {
      console.error('Error fetching monthly sales:', error);
      setError('Failed to fetch monthly sales data');
    }
  };

  // Update pie chart when products change
  useEffect(() => {
    if (products.length > 0) {
      setPieChartData(prev => ({
        ...prev,
        labels: products.map(p => p.name),
        datasets: [{
          ...prev.datasets[0],
          label: "Product Stock",
          data: products.map(p => p.stock || 0),
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
            "rgba(255, 159, 64, 0.7)",
            "rgba(201, 203, 207, 0.7)",
            "rgba(255, 145, 164, 0.7)",
            "rgba(28, 200, 138, 0.7)",
            "rgba(90, 103, 216, 0.7)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 206, 86)",
            "rgb(75, 192, 192)",
            "rgb(153, 102, 255)",
            "rgb(255, 159, 64)",
            "rgb(201, 203, 207)",
            "rgb(255, 145, 164)",
            "rgb(28, 200, 138)",
            "rgb(90, 103, 216)",
          ],
          borderWidth: 1,
        }]
      }));
    }
  }, [products]);

  // Add options for the pie chart
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Stock Distribution by Product',
        font: {
          size: 14
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} units (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex flex-col gap-5 p-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <select 
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          disabled={isLoading}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
          </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
          <div>
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {isLoading ? '...' : formatPKR(saleAmount)}
            </p>
          </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            </div>
          </div>
          </div>

        {/* Purchases Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
          <div>
              <p className="text-sm font-medium text-gray-500">Total Purchases</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {isLoading ? '...' : formatPKR(purchaseAmount)}
            </p>
          </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            </div>
          </div>
          </div>

        {/* Profit Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
          <div>
              <p className="text-sm font-medium text-gray-500">Net Profit</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {isLoading ? '...' : formatPKR(profit)}
            </p>
          </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            </div>
          </div>
          </div>

        {/* Stores Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
          <div>
              <p className="text-sm font-medium text-gray-500">Total Stores</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {isLoading ? '...' : stores.length}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Sales Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Sales</h2>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="h-80">
            <Chart
                options={{
                  ...chart.options,
                  chart: {
                    ...chart.options.chart,
                    toolbar: {
                      show: true,
                      tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                      }
                    }
                  },
                  colors: ['#6366F1'],
                  grid: {
                    borderColor: '#E5E7EB',
                    strokeDashArray: 4,
                  },
                  xaxis: {
                    ...chart.options.xaxis,
                    labels: {
                      style: {
                        colors: '#6B7280',
                        fontSize: '12px',
                      },
                      rotate: -45,
                    }
                  },
                  yaxis: {
                    labels: {
                      style: {
                        colors: '#6B7280',
                        fontSize: '12px',
                      },
                      formatter: function(value) {
                        return formatPKR(value);
                      }
                    }
                  }
                }}
              series={chart.series}
              type="bar"
                height="100%"
            />
          </div>
          )}
        </div>

        {/* Product Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Distribution</h2>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No products available
            </div>
          ) : (
            <div className="h-80">
              <Doughnut 
                data={pieChartData} 
                options={{
                  ...pieChartOptions,
                  maintainAspectRatio: false,
                  plugins: {
                    ...pieChartOptions.plugins,
                    legend: {
                      ...pieChartOptions.plugins.legend,
                      position: window.innerWidth < 768 ? 'bottom' : 'right',
                      labels: {
                        ...pieChartOptions.plugins.legend.labels,
                        padding: window.innerWidth < 768 ? 10 : 15,
                        boxWidth: window.innerWidth < 768 ? 10 : 12,
                        font: {
                          size: window.innerWidth < 768 ? 10 : 11
                        }
                      }
                    }
                  }
                }}
              />
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
