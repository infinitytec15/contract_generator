"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

type Client = {
  id: string;
  status: string;
  payment_status: string;
  is_blocked: boolean;
};

type ClientChartProps = {
  clients: Client[];
};

export function ClientChart({ clients }: ClientChartProps) {
  const statusChartRef = useRef<HTMLCanvasElement | null>(null);
  const paymentChartRef = useRef<HTMLCanvasElement | null>(null);
  const statusChartInstance = useRef<Chart | null>(null);
  const paymentChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!clients.length) return;

    // Count clients by status
    const statusCounts = {
      active: clients.filter((c) => c.status === "active").length,
      inactive: clients.filter((c) => c.status === "inactive").length,
      suspended: clients.filter((c) => c.status === "suspended").length,
      blocked: clients.filter((c) => c.is_blocked).length,
    };

    // Count clients by payment status
    const paymentCounts = {
      paid: clients.filter((c) => c.payment_status === "paid").length,
      pending: clients.filter((c) => c.payment_status === "pending").length,
      overdue: clients.filter((c) => c.payment_status === "overdue").length,
    };

    // Create status chart
    if (statusChartRef.current) {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }

      const ctx = statusChartRef.current.getContext("2d");
      if (ctx) {
        statusChartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Ativos", "Inativos", "Suspensos", "Bloqueados"],
            datasets: [
              {
                data: [
                  statusCounts.active,
                  statusCounts.inactive,
                  statusCounts.suspended,
                  statusCounts.blocked,
                ],
                backgroundColor: [
                  "rgba(34, 197, 94, 0.7)",
                  "rgba(156, 163, 175, 0.7)",
                  "rgba(234, 88, 12, 0.7)",
                  "rgba(239, 68, 68, 0.7)",
                ],
                borderColor: [
                  "rgba(34, 197, 94, 1)",
                  "rgba(156, 163, 175, 1)",
                  "rgba(234, 88, 12, 1)",
                  "rgba(239, 68, 68, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  usePointStyle: true,
                  padding: 20,
                },
              },
              title: {
                display: true,
                text: "Status dos Clientes",
                font: {
                  size: 16,
                },
              },
            },
            cutout: "60%",
          },
        });
      }
    }

    // Create payment status chart
    if (paymentChartRef.current) {
      if (paymentChartInstance.current) {
        paymentChartInstance.current.destroy();
      }

      const ctx = paymentChartRef.current.getContext("2d");
      if (ctx) {
        paymentChartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Pagos", "Pendentes", "Inadimplentes"],
            datasets: [
              {
                data: [
                  paymentCounts.paid,
                  paymentCounts.pending,
                  paymentCounts.overdue,
                ],
                backgroundColor: [
                  "rgba(34, 197, 94, 0.7)",
                  "rgba(234, 179, 8, 0.7)",
                  "rgba(239, 68, 68, 0.7)",
                ],
                borderColor: [
                  "rgba(34, 197, 94, 1)",
                  "rgba(234, 179, 8, 1)",
                  "rgba(239, 68, 68, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  usePointStyle: true,
                  padding: 20,
                },
              },
              title: {
                display: true,
                text: "Status de Pagamento",
                font: {
                  size: 16,
                },
              },
            },
            cutout: "60%",
          },
        });
      }
    }

    return () => {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }
      if (paymentChartInstance.current) {
        paymentChartInstance.current.destroy();
      }
    };
  }, [clients]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <div>
        <canvas ref={statusChartRef} />
      </div>
      <div>
        <canvas ref={paymentChartRef} />
      </div>
    </div>
  );
}
