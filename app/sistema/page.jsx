"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar, BarChart3, Settings, Search, Filter, ChevronDown, ChevronRight, X, Download, Save } from "lucide-react";

const GanttChart = ({ institutions }) => {
    const months = ["Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    // Função para calcular posição no Gantt (baseado em abril 2026 = semana 0)
    const getGanttPosition = (dateStr) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            const april2026 = new Date("2026-04-01");
            const diffTime = date - april2026;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.floor(diffDays / 7);
            return Math.max(0, Math.min(35, diffWeeks)); // 36 semanas total (0-35)
        } catch {
            return null;
        }
    };

    return (
        <div className="gantt-container">
            <div className="gantt-header">
                <div className="gantt-title-col">Instituição / Atividade</div>
                <div className="gantt-timeline">
                    {months.map((month, idx) => (
                        <div key={month} className="gantt-month">
                            {month}
                            <div className="gantt-weeks">
                                {[1, 2, 3, 4].map((w) => (
                                    <div key={w} className="gantt-week">
                                        {w}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="gantt-body">
                {institutions.map((inst, idx) => (
                    <div key={idx} className="gantt-row-group">
                        <div className="gantt-institution-row">
                            <div className="gantt-title-col">
                                <strong>{inst.name}</strong>
                            </div>
                            <div className="gantt-timeline">
                                {/* Barra principal da instituição baseada nas atividades */}
                                {inst.activities &&
                                    inst.activities.length > 0 &&
                                    (() => {
                                        const validActivities = inst.activities.filter((a) => a.startDate && a.endDate);
                                        if (validActivities.length === 0) return null;

                                        const positions = validActivities
                                            .map((a) => ({
                                                start: getGanttPosition(a.startDate),
                                                end: getGanttPosition(a.endDate),
                                            }))
                                            .filter((p) => p.start !== null && p.end !== null);

                                        if (positions.length === 0) return null;

                                        const minStart = Math.min(...positions.map((p) => p.start));
                                        const maxEnd = Math.max(...positions.map((p) => p.end));
                                        const width = maxEnd - minStart;

                                        return (
                                            <div
                                                className="gantt-bar gantt-bar-main"
                                                style={{
                                                    left: `${(minStart / 36) * 100}%`,
                                                    width: `${Math.max(1, (width / 36) * 100)}%`,
                                                }}
                                            >
                                                <span className="gantt-bar-label">{inst.status}</span>
                                            </div>
                                        );
                                    })()}
                            </div>
                        </div>

                        {inst.activities?.map((activity, aidx) => {
                            const start = getGanttPosition(activity.startDate);
                            const end = getGanttPosition(activity.endDate);

                            // Determinar classe de cor baseado no status da atividade
                            let barClass = "gantt-bar-activity-progress"; // azul (padrão - em andamento)
                            if (activity.status === "Concluído") {
                                barClass = "gantt-bar-activity-completed"; // verde
                            } else if (activity.status === "Projetado" || activity.status === "Planejado") {
                                barClass = "gantt-bar-activity-planned"; // laranja
                            }

                            return (
                                <div key={aidx} className="gantt-activity-row">
                                    <div className="gantt-title-col">
                                        <span className="activity-name">
                                            {activity.name}
                                            {activity.startDate && activity.endDate && (
                                                <span className="activity-dates">
                                                    {" "}
                                                    ({new Date(activity.startDate).toLocaleDateString("pt-BR")} -{" "}
                                                    {new Date(activity.endDate).toLocaleDateString("pt-BR")})
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="gantt-timeline">
                                        {start !== null && end !== null && (
                                            <div
                                                className={`gantt-bar gantt-bar-activity ${barClass}`}
                                                style={{
                                                    left: `${(start / 36) * 100}%`,
                                                    width: `${Math.max(1, ((end - start) / 36) * 100)}%`,
                                                }}
                                                title={`${activity.name} - ${activity.status || "Em andamento"}`}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const InstitutionCard = ({ institution, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const statusColors = {
        "Não iniciado": "status-gray",
        "Em andamento": "status-blue",
        Concluído: "status-green",
        Atrasado: "status-red",
        Pendente: "status-yellow",
    };

    const activityStatusColors = {
        Concluído: "activity-status-green",
        "Em andamento": "activity-status-blue",
        Projetado: "activity-status-orange",
        Planejado: "activity-status-orange",
    };

    return (
        <div className="institution-card">
            <div className="card-header">
                <div className="card-title-row">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="expand-btn">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <h3>{institution.name}</h3>
                    <span className={`status-badge ${statusColors[institution.status] || "status-gray"}`}>{institution.status}</span>
                </div>

                <div className="card-actions">
                    <button onClick={() => onEdit(institution)} className="btn-icon btn-edit">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(institution.id)} className="btn-icon btn-delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="card-body">
                <div className="info-row">
                    <span className="label">Estado:</span>
                    <span>{institution.state}</span>
                </div>
                <div className="info-row">
                    <span className="label">Responsável:</span>
                    <span>{institution.responsible}</span>
                </div>
                {institution.observations && (
                    <div className="info-row">
                        <span className="label">Observações:</span>
                        <span className="observations">{institution.observations}</span>
                    </div>
                )}
            </div>

            {isExpanded && institution.activities && institution.activities.length > 0 && (
                <div className="activities-section">
                    <h4>Atividades ({institution.activities.length})</h4>
                    <div className="activities-list">
                        {institution.activities.map((activity, idx) => (
                            <div key={idx} className="activity-item">
                                <div className="activity-header">
                                    <div className="activity-name">{activity.name}</div>
                                    {activity.status && (
                                        <span className={`activity-status-badge ${activityStatusColors[activity.status] || "activity-status-blue"}`}>
                                            {activity.status}
                                        </span>
                                    )}
                                </div>
                                {activity.responsible && <div className="activity-resp">Responsável: {activity.responsible}</div>}
                                {activity.startDate && activity.endDate && (
                                    <div className="activity-dates-display">
                                        <Calendar size={12} />
                                        {new Date(activity.startDate).toLocaleDateString("pt-BR")} até{" "}
                                        {new Date(activity.endDate).toLocaleDateString("pt-BR")}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const InstitutionForm = ({ institution, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
        institution || {
            name: "",
            state: "",
            responsible: "",
            status: "Não iniciado",
            observations: "",
            activities: [],
        }
    );

    const [newActivity, setNewActivity] = useState({
        name: "",
        responsible: "",
        startDate: "",
        endDate: "",
        status: "Projetado",
    });

    const statusOptions = ["Não iniciado", "Em andamento", "Concluído", "Atrasado", "Pendente"];
    const activityStatusOptions = ["Projetado", "Em andamento", "Concluído"];
    const brazilStates = [
        "AC",
        "AL",
        "AM",
        "AP",
        "BA",
        "CE",
        "DF",
        "ES",
        "GO",
        "MA",
        "MG",
        "MS",
        "MT",
        "PA",
        "PB",
        "PE",
        "PI",
        "PR",
        "RJ",
        "RN",
        "RO",
        "RR",
        "RS",
        "SC",
        "SE",
        "SP",
        "TO",
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const addActivity = () => {
        if (newActivity.name.trim()) {
            setFormData({
                ...formData,
                activities: [...(formData.activities || []), newActivity],
            });
            setNewActivity({ name: "", responsible: "", startDate: "", endDate: "", status: "Projetado" });
        }
    };

    const removeActivity = (idx) => {
        setFormData({
            ...formData,
            activities: formData.activities.filter((_, i) => i !== idx),
        });
    };

    const activityStatusColors = {
        Concluído: "activity-status-green",
        "Em andamento": "activity-status-blue",
        Projetado: "activity-status-orange",
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>{institution ? "Editar Instituição" : "Nova Instituição"}</h2>
                    <button onClick={onCancel} className="btn-close">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>Nome da Instituição *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: FCECON - Manaus"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Estado *</label>
                            <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required>
                                <option value="">Selecione</option>
                                {brazilStates.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Status *</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required>
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Responsável</label>
                        <input
                            type="text"
                            value={formData.responsible}
                            onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                            placeholder="Ex: ACC"
                        />
                    </div>

                    <div className="form-group">
                        <label>Observações</label>
                        <textarea
                            value={formData.observations}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                            placeholder="Informações adicionais..."
                            rows="3"
                        />
                    </div>

                    <div className="activities-form">
                        <h3>Atividades e Cronograma</h3>

                        {formData.activities && formData.activities.length > 0 && (
                            <div className="activities-list-form">
                                {formData.activities.map((activity, idx) => (
                                    <div key={idx} className="activity-item-form">
                                        <div className="activity-info">
                                            <strong>{activity.name}</strong>
                                            <div className="activity-meta">
                                                {activity.status && (
                                                    <span className={`resp-tag ${activityStatusColors[activity.status] || "activity-status-blue"}`}>
                                                        {activity.status}
                                                    </span>
                                                )}
                                                {activity.responsible && <span className="resp-tag">Resp: {activity.responsible}</span>}
                                                {activity.startDate && activity.endDate && (
                                                    <div className="dates-tag">
                                                        <Calendar size={12} />
                                                        {new Date(activity.startDate).toLocaleDateString("pt-BR")} -{" "}
                                                        {new Date(activity.endDate).toLocaleDateString("pt-BR")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeActivity(idx)} className="btn-icon btn-delete-small">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="add-activity">
                            <div className="activity-row-1">
                                <input
                                    type="text"
                                    value={newActivity.name}
                                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                                    placeholder="Nome da atividade *"
                                    className="activity-name-input"
                                />
                                <input
                                    type="text"
                                    value={newActivity.responsible}
                                    onChange={(e) => setNewActivity({ ...newActivity, responsible: e.target.value })}
                                    placeholder="Responsável"
                                    className="activity-resp-input"
                                />
                            </div>
                            <div className="activity-row-2">
                                <div className="date-input-group">
                                    <label>Data Início</label>
                                    <input
                                        type="date"
                                        value={newActivity.startDate}
                                        onChange={(e) => setNewActivity({ ...newActivity, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="date-input-group">
                                    <label>Data Fim</label>
                                    <input
                                        type="date"
                                        value={newActivity.endDate}
                                        onChange={(e) => setNewActivity({ ...newActivity, endDate: e.target.value })}
                                    />
                                </div>
                                <div className="date-input-group">
                                    <label>Status</label>
                                    <select value={newActivity.status} onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value })}>
                                        {activityStatusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button type="button" onClick={addActivity} className="btn-add-activity">
                                    <Plus size={16} /> Adicionar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function MonitoringSystem() {
    const STORAGE_KEY = "super-centro-institutions";

    const initialInstitutions = [
        {
            id: 1,
            name: "FCECON (AM)",
            state: "AM",
            responsible: "ACC",
            status: "Em andamento",
            observations: "",
            activities: [
                { name: "Entrega Scanner", responsible: "ACC", startDate: "2026-04-01", endDate: "2026-04-30", status: "Concluído" },
                { name: "Visita Técnica", responsible: "ACC", startDate: "2026-05-01", endDate: "2026-05-15", status: "Em andamento" },
                {
                    name: "Apresentação da arquitetura do sistema",
                    responsible: "ACC",
                    startDate: "2026-05-16",
                    endDate: "2026-06-15",
                    status: "Projetado",
                },
            ],
        },
        {
            id: 2,
            name: "Hospital Getúlio Vargas – HGV (PI)",
            state: "PI",
            responsible: "ACC",
            status: "Em andamento",
            observations: "Sala do scanner com previsão de finalização da obra em 20/05",
            activities: [
                { name: "Entrega Scanner", responsible: "ACC", startDate: "2026-05-01", endDate: "2026-05-20", status: "Em andamento" },
                { name: "Visita Técnica", responsible: "ACC", startDate: "2026-05-21", endDate: "2026-06-10", status: "Projetado" },
            ],
        },
        {
            id: 3,
            name: "UFVJM (MG)",
            state: "MG",
            responsible: "ACC",
            status: "Em andamento",
            observations: "",
            activities: [
                { name: "Entrega Scanner", responsible: "ACC", startDate: "2026-04-01", endDate: "2026-04-15", status: "Concluído" },
                { name: "Visita Técnica", responsible: "ACC", startDate: "2026-04-16", endDate: "2026-05-10", status: "Em andamento" },
            ],
        },
        {
            id: 4,
            name: "Hospital Regional de Itapipoca (CE)",
            state: "CE",
            responsible: "ACC",
            status: "Concluído",
            observations: "",
            activities: [{ name: "Projeto entregue", responsible: "ACC", startDate: "2026-04-01", endDate: "2026-04-30", status: "Concluído" }],
        },
        {
            id: 5,
            name: "Hospital Geral de Vitória da Conquista (BA)",
            state: "BA",
            responsible: "ACC",
            status: "Em andamento",
            observations: "Finalização da obra prevista até junho de 2026",
            activities: [
                { name: "Obras de adequação", responsible: "Estado", startDate: "2026-05-01", endDate: "2026-06-30", status: "Em andamento" },
                { name: "Instalação de equipamentos", responsible: "ACC", startDate: "2026-07-01", endDate: "2026-08-15", status: "Projetado" },
            ],
        },
        {
            id: 6,
            name: "Hospital de Câncer do Sertão do Araripe (PE)",
            state: "PE",
            responsible: "ACC",
            status: "Em andamento",
            observations: "Finalização da obra prevista para maio de 2026",
            activities: [
                { name: "Obras de adequação", responsible: "Estado", startDate: "2026-04-15", endDate: "2026-05-31", status: "Em andamento" },
                { name: "Entrega Scanner", responsible: "ACC", startDate: "2026-06-01", endDate: "2026-06-30", status: "Projetado" },
            ],
        },
        {
            id: 7,
            name: "Hospital Regional do Baixo Amazonas (PA)",
            state: "PA",
            responsible: "ACC",
            status: "Pendente",
            observations: "Redefinição final em 08/05/2026",
            activities: [{ name: "Reunião de definição", responsible: "ACC", startDate: "2026-05-08", endDate: "2026-05-08", status: "Projetado" }],
        },
        {
            id: 8,
            name: "INCA (RJ)",
            state: "RJ",
            responsible: "ACC",
            status: "Em andamento",
            observations: "",
            activities: [
                { name: "Entrega Scanner", responsible: "ACC", startDate: "2026-04-10", endDate: "2026-05-15", status: "Concluído" },
                { name: "Capacitação da equipe", responsible: "ACC", startDate: "2026-05-20", endDate: "2026-06-20", status: "Projetado" },
            ],
        },
    ];

    const [institutions, setInstitutions] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : initialInstitutions;
        } catch {
            return initialInstitutions;
        }
    });

    const [currentView, setCurrentView] = useState("list");
    const [showForm, setShowForm] = useState(false);
    const [editingInstitution, setEditingInstitution] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [saveMessage, setSaveMessage] = useState("");

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(institutions));
            if (institutions.length > 0) {
                setSaveMessage("Salvo automaticamente");
                setTimeout(() => setSaveMessage(""), 2000);
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
        }
    }, [institutions]);

    const handleSave = (institutionData) => {
        if (editingInstitution) {
            setInstitutions(
                institutions.map((inst) => (inst.id === editingInstitution.id ? { ...institutionData, id: editingInstitution.id } : inst))
            );
        } else {
            setInstitutions([
                ...institutions,
                {
                    ...institutionData,
                    id: Date.now(),
                },
            ]);
        }
        setShowForm(false);
        setEditingInstitution(null);
    };

    const handleEdit = (institution) => {
        setEditingInstitution(institution);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (confirm("Tem certeza que deseja excluir esta instituição?")) {
            setInstitutions(institutions.filter((inst) => inst.id !== id));
        }
    };

    const exportToPDF = () => {
        const printWindow = window.open("", "_blank");
        const statusCount = institutions.reduce((acc, inst) => {
            acc[inst.status] = (acc[inst.status] || 0) + 1;
            return acc;
        }, {});

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Monitoramento - Super Centro Brasil</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #1351B4;
          }
          .header h1 {
            color: #1351B4;
            margin: 0 0 10px 0;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #1351B4;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
          }
          .institution {
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .institution h3 {
            color: #1351B4;
            margin: 0 0 15px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .status-badge {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-gray { background: #e9ecef; color: #495057; }
          .status-blue { background: #1351B4; color: white; }
          .status-green { background: #168821; color: white; }
          .status-red { background: #E52207; color: white; }
          .status-yellow { background: #FFCD07; color: #333; }
          .activity-status-green { background: #168821; color: white; }
          .activity-status-blue { background: #1351B4; color: white; }
          .activity-status-orange { background: #FF8C00; color: white; }
          .info-table {
            width: 100%;
            margin: 15px 0;
          }
          .info-table td {
            padding: 8px 0;
            vertical-align: top;
          }
          .info-table td:first-child {
            font-weight: bold;
            color: #666;
            width: 150px;
          }
          .activities {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
          }
          .activities h4 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 14px;
          }
          .activity {
            padding: 8px 12px;
            margin: 5px 0;
            background: #f8f9fa;
            border-left: 3px solid #1351B4;
          }
          .activity-dates {
            font-size: 11px;
            color: #666;
            margin-top: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sistema de Monitoramento</h1>
          <p>Super Centro Brasil para Diagnóstico de Câncer</p>
          <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
        </div>
        
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${institutions.length}</div>
            <div class="stat-label">Total de Instituições</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${statusCount["Em andamento"] || 0}</div>
            <div class="stat-label">Em Andamento</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${statusCount["Concluído"] || 0}</div>
            <div class="stat-label">Concluídos</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${statusCount["Pendente"] || 0}</div>
            <div class="stat-label">Pendentes</div>
          </div>
        </div>
        
        ${institutions
            .map(
                (inst) => `
          <div class="institution">
            <h3>
              ${inst.name}
              <span class="status-badge status-${inst.status === "Não iniciado" ? "gray" : inst.status === "Em andamento" ? "blue" : inst.status === "Concluído" ? "green" : inst.status === "Atrasado" ? "red" : "yellow"}">${inst.status}</span>
            </h3>
            <table class="info-table">
              <tr>
                <td>Estado:</td>
                <td>${inst.state}</td>
              </tr>
              <tr>
                <td>Responsável:</td>
                <td>${inst.responsible}</td>
              </tr>
              ${
                  inst.observations
                      ? `
              <tr>
                <td>Observações:</td>
                <td>${inst.observations}</td>
              </tr>
              `
                      : ""
              }
            </table>
            ${
                inst.activities && inst.activities.length > 0
                    ? `
              <div class="activities">
                <h4>Atividades (${inst.activities.length})</h4>
                ${inst.activities
                    .map(
                        (act) => `
                  <div class="activity">
                    <strong>${act.name}</strong>
                    ${act.status ? ` <span class="status-badge activity-status-${act.status === "Concluído" ? "green" : act.status === "Projetado" ? "orange" : "blue"}">${act.status}</span>` : ""}
                    ${act.responsible ? ` - Responsável: ${act.responsible}` : ""}
                    ${
                        act.startDate && act.endDate
                            ? `
                      <div class="activity-dates">
                        📅 ${new Date(act.startDate).toLocaleDateString("pt-BR")} até ${new Date(act.endDate).toLocaleDateString("pt-BR")}
                      </div>
                    `
                            : ""
                    }
                  </div>
                `
                    )
                    .join("")}
              </div>
            `
                    : ""
            }
          </div>
        `
            )
            .join("")}
        
        <div class="footer">
          <p>Ministério da Saúde - Super Centro Brasil para Diagnóstico de Câncer</p>
          <p>NUP/SEI: 25000.096228/2025-84</p>
        </div>
      </body>
      </html>
    `;

        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const filteredInstitutions = institutions.filter((inst) => {
        const matchesSearch =
            inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || inst.state.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || inst.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const statusCount = institutions.reduce((acc, inst) => {
        acc[inst.status] = (acc[inst.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="gov-logo">
                            <BarChart3 size={32} />
                        </div>
                        <div>
                            <h1>Sistema de Monitoramento</h1>
                            <p>Super Centro Brasil para Diagnóstico de Câncer</p>
                        </div>
                    </div>

                    <div className="header-stats">
                        <div className="stat">
                            <span className="stat-value">{institutions.length}</span>
                            <span className="stat-label">Instituições</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{statusCount["Em andamento"] || 0}</span>
                            <span className="stat-label">Em Andamento</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{statusCount["Concluído"] || 0}</span>
                            <span className="stat-label">Concluídos</span>
                        </div>
                    </div>
                </div>
            </header>

            <nav className="navbar">
                <div className="nav-tabs">
                    <button className={`nav-tab ${currentView === "list" ? "active" : ""}`} onClick={() => setCurrentView("list")}>
                        <Settings size={18} />
                        Gerenciar Instituições
                    </button>
                    <button className={`nav-tab ${currentView === "gantt" ? "active" : ""}`} onClick={() => setCurrentView("gantt")}>
                        <Calendar size={18} />
                        Gráfico de Gantt
                    </button>
                </div>

                <div className="nav-actions">
                    {saveMessage && (
                        <span className="save-message">
                            <Save size={14} /> {saveMessage}
                        </span>
                    )}
                    <button onClick={exportToPDF} className="btn-export">
                        <Download size={16} />
                        Exportar PDF
                    </button>
                </div>
            </nav>

            <main className="main">
                {currentView === "list" && (
                    <>
                        <div className="toolbar">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar instituição..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="filter-box">
                                <Filter size={18} />
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">Todos os status</option>
                                    <option value="Não iniciado">Não iniciado</option>
                                    <option value="Em andamento">Em andamento</option>
                                    <option value="Concluído">Concluído</option>
                                    <option value="Atrasado">Atrasado</option>
                                    <option value="Pendente">Pendente</option>
                                </select>
                            </div>

                            <button
                                onClick={() => {
                                    setEditingInstitution(null);
                                    setShowForm(true);
                                }}
                                className="btn btn-primary"
                            >
                                <Plus size={18} />
                                Nova Instituição
                            </button>
                        </div>

                        <div className="institutions-grid">
                            {filteredInstitutions.map((institution) => (
                                <InstitutionCard key={institution.id} institution={institution} onEdit={handleEdit} onDelete={handleDelete} />
                            ))}

                            {filteredInstitutions.length === 0 && (
                                <div className="empty-state">
                                    <p>Nenhuma instituição encontrada</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {currentView === "gantt" && (
                    <div className="gantt-view">
                        <div className="gantt-header-section">
                            <h2>Cronograma de Processos - 2026</h2>
                            <p>Visualização temporal das atividades das instituições (Abril a Dezembro 2026)</p>
                            <div className="gantt-legend">
                                <div className="legend-item">
                                    <div className="legend-color legend-green"></div>
                                    <span>Concluído</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-color legend-blue"></div>
                                    <span>Em andamento</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-color legend-orange"></div>
                                    <span>Projetado</span>
                                </div>
                            </div>
                        </div>
                        <GanttChart institutions={filteredInstitutions} />
                    </div>
                )}
            </main>

            {showForm && (
                <InstitutionForm
                    institution={editingInstitution}
                    onSave={handleSave}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingInstitution(null);
                    }}
                />
            )}

            <style jsx>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .app {
                    min-height: 100vh;
                    background: #f8f9fa;
                    font-family: "Rawline", "Segoe UI", Arial, sans-serif;
                    color: #333;
                }

                .header {
                    background: #1351b4;
                    color: white;
                    padding: 1.5rem 2rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .gov-logo {
                    color: #ffcd07;
                }

                .header h1 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .header p {
                    font-size: 0.875rem;
                    opacity: 0.9;
                }

                .header-stats {
                    display: flex;
                    gap: 2rem;
                }

                .stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #ffcd07;
                }

                .stat-label {
                    font-size: 0.7rem;
                    opacity: 0.9;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .navbar {
                    background: white;
                    border-bottom: 2px solid #e9ecef;
                    padding: 0 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-tabs {
                    display: flex;
                    gap: 0.5rem;
                }

                .nav-tab {
                    background: none;
                    border: none;
                    color: #666;
                    padding: 1rem 1.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.925rem;
                    font-weight: 500;
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s;
                }

                .nav-tab:hover {
                    color: #1351b4;
                    background: #f8f9fa;
                }

                .nav-tab.active {
                    color: #1351b4;
                    border-bottom-color: #1351b4;
                }

                .nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .save-message {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #168821;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .btn-export {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #168821;
                    color: white;
                    border: none;
                    padding: 0.625rem 1.25rem;
                    border-radius: 4px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-export:hover {
                    background: #0f6618;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(22, 136, 33, 0.3);
                }

                .main {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .toolbar {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }

                .search-box,
                .filter-box {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 0.75rem 1rem;
                    color: #666;
                    flex: 1;
                    min-width: 200px;
                }

                .search-box input,
                .filter-box select {
                    background: none;
                    border: none;
                    color: #333;
                    outline: none;
                    font-size: 0.925rem;
                    flex: 1;
                }

                .filter-box select {
                    cursor: pointer;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    border: none;
                    font-size: 0.925rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: #1351b4;
                    color: white;
                }

                .btn-primary:hover {
                    background: #0c3c87;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(19, 81, 180, 0.3);
                }

                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #5a6268;
                }

                .institutions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 1.5rem;
                }

                .institution-card {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: all 0.3s;
                }

                .institution-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    border-color: #1351b4;
                }

                .card-header {
                    padding: 1.25rem;
                    background: #f8f9fa;
                    border-bottom: 1px solid #dee2e6;
                }

                .card-title-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }

                .expand-btn {
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .expand-btn:hover {
                    background: #e9ecef;
                    color: #1351b4;
                }

                .card-title-row h3 {
                    flex: 1;
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1351b4;
                }

                .status-badge {
                    padding: 0.375rem 0.875rem;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .status-gray {
                    background: #e9ecef;
                    color: #495057;
                }
                .status-blue {
                    background: #1351b4;
                    color: white;
                }
                .status-green {
                    background: #168821;
                    color: white;
                }
                .status-red {
                    background: #e52207;
                    color: white;
                }
                .status-yellow {
                    background: #ffcd07;
                    color: #333;
                }

                .activity-status-badge {
                    padding: 0.25rem 0.625rem;
                    border-radius: 12px;
                    font-size: 0.65rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .activity-status-green {
                    background: #168821;
                    color: white;
                }
                .activity-status-blue {
                    background: #1351b4;
                    color: white;
                }
                .activity-status-orange {
                    background: #ff8c00;
                    color: white;
                }

                .card-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-icon {
                    background: white;
                    border: 1px solid #dee2e6;
                    color: #666;
                    padding: 0.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .btn-icon:hover {
                    background: #f8f9fa;
                    color: #333;
                }

                .btn-edit:hover {
                    background: #e7f1ff;
                    color: #1351b4;
                    border-color: #1351b4;
                }

                .btn-delete:hover {
                    background: #ffe5e5;
                    color: #e52207;
                    border-color: #e52207;
                }

                .card-body {
                    padding: 1.25rem;
                }

                .info-row {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    font-size: 0.925rem;
                }

                .info-row:last-child {
                    margin-bottom: 0;
                }

                .label {
                    color: #666;
                    font-weight: 500;
                    min-width: 100px;
                }

                .observations {
                    color: #495057;
                    font-size: 0.875rem;
                    line-height: 1.5;
                }

                .activities-section {
                    padding: 1.25rem;
                    background: #f8f9fa;
                    border-top: 1px solid #dee2e6;
                }

                .activities-section h4 {
                    font-size: 0.875rem;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1rem;
                }

                .activities-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .activity-item {
                    background: white;
                    padding: 0.75rem;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                }

                .activity-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .activity-name {
                    color: #333;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .activity-resp {
                    color: #666;
                    font-size: 0.75rem;
                    margin-bottom: 0.25rem;
                }

                .activity-dates-display {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    color: #1351b4;
                    font-size: 0.75rem;
                    margin-top: 0.375rem;
                }

                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 4rem 2rem;
                    color: #666;
                    font-size: 1.125rem;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 2rem;
                }

                .modal {
                    background: white;
                    border-radius: 8px;
                    max-width: 850px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                }

                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8f9fa;
                }

                .modal-header h2 {
                    font-size: 1.5rem;
                    color: #1351b4;
                }

                .btn-close {
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    transition: all 0.2s;
                }

                .btn-close:hover {
                    background: #e9ecef;
                    color: #333;
                }

                .form {
                    padding: 1.5rem;
                }

                .form-group {
                    margin-bottom: 1.25rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .form-group label {
                    display: block;
                    color: #495057;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    background: white;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    padding: 0.75rem;
                    color: #333;
                    font-size: 0.925rem;
                    transition: all 0.2s;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #1351b4;
                    box-shadow: 0 0 0 3px rgba(19, 81, 180, 0.1);
                }

                .form-group textarea {
                    resize: vertical;
                }

                .activities-form {
                    margin: 1.5rem 0;
                    padding: 1.5rem;
                    background: #f8f9fa;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                }

                .activities-form h3 {
                    font-size: 1rem;
                    color: #495057;
                    margin-bottom: 1rem;
                }

                .activities-list-form {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .activity-item-form {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    padding: 0.875rem;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                    gap: 1rem;
                }

                .activity-info {
                    flex: 1;
                }

                .activity-info strong {
                    color: #333;
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .activity-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    align-items: center;
                }

                .resp-tag {
                    display: inline-block;
                    background: #e7f1ff;
                    color: #1351b4;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                }

                .resp-tag.activity-status-green {
                    background: #168821;
                    color: white;
                }
                .resp-tag.activity-status-blue {
                    background: #1351b4;
                    color: white;
                }
                .resp-tag.activity-status-orange {
                    background: #ff8c00;
                    color: white;
                }

                .dates-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    background: #f0fdf4;
                    color: #168821;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                }

                .btn-delete-small {
                    background: #ffe5e5;
                    border: 1px solid #e52207;
                    color: #e52207;
                    padding: 0.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .btn-delete-small:hover {
                    background: #ffcccc;
                }

                .add-activity {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .activity-row-1,
                .activity-row-2 {
                    display: grid;
                    gap: 0.75rem;
                }

                .activity-row-1 {
                    grid-template-columns: 2fr 1fr;
                }

                .activity-row-2 {
                    grid-template-columns: 1fr 1fr 1fr auto;
                }

                .add-activity input,
                .add-activity select {
                    background: white;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    padding: 0.625rem;
                    color: #333;
                    font-size: 0.875rem;
                }

                .add-activity input:focus,
                .add-activity select:focus {
                    outline: none;
                    border-color: #1351b4;
                    box-shadow: 0 0 0 2px rgba(19, 81, 180, 0.1);
                }

                .date-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .date-input-group label {
                    font-size: 0.7rem;
                    color: #666;
                    font-weight: 500;
                }

                .btn-add-activity {
                    background: #e7f1ff;
                    border: 1px solid #1351b4;
                    color: #1351b4;
                    padding: 0.625rem 1.25rem;
                    border-radius: 4px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.375rem;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .btn-add-activity:hover {
                    background: #cce0ff;
                }

                .form-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                }

                .gantt-view {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .gantt-header-section {
                    padding: 1.5rem;
                    background: #f8f9fa;
                    border-bottom: 1px solid #dee2e6;
                }

                .gantt-header-section h2 {
                    font-size: 1.5rem;
                    color: #1351b4;
                    margin-bottom: 0.5rem;
                }

                .gantt-header-section p {
                    color: #666;
                    font-size: 0.925rem;
                    margin-bottom: 1rem;
                }

                .gantt-legend {
                    display: flex;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: #666;
                }

                .legend-color {
                    width: 20px;
                    height: 12px;
                    border-radius: 2px;
                }

                .legend-green {
                    background: #168821;
                }
                .legend-blue {
                    background: #1351b4;
                }
                .legend-orange {
                    background: #ff8c00;
                }

                .gantt-container {
                    overflow-x: auto;
                }

                .gantt-header {
                    display: flex;
                    background: #1351b4;
                    color: white;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .gantt-title-col {
                    width: 350px;
                    min-width: 350px;
                    padding: 1rem;
                    font-weight: 600;
                    border-right: 1px solid rgba(255, 255, 255, 0.2);
                }

                .gantt-timeline {
                    flex: 1;
                    display: flex;
                    position: relative;
                }

                .gantt-month {
                    flex: 1;
                    min-width: 120px;
                    border-right: 1px solid rgba(255, 255, 255, 0.2);
                }

                .gantt-month:first-child {
                    border-left: 1px solid rgba(255, 255, 255, 0.2);
                }

                .gantt-month > div:first-child {
                    padding: 0.5rem;
                    text-align: center;
                    font-weight: 600;
                    color: #ffcd07;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }

                .gantt-weeks {
                    display: flex;
                }

                .gantt-week {
                    flex: 1;
                    padding: 0.375rem;
                    text-align: center;
                    font-size: 0.75rem;
                    opacity: 0.8;
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                }

                .gantt-week:last-child {
                    border-right: none;
                }

                .gantt-body {
                    background: white;
                }

                .gantt-row-group {
                    border-bottom: 2px solid #dee2e6;
                }

                .gantt-institution-row,
                .gantt-activity-row {
                    display: flex;
                    border-bottom: 1px solid #e9ecef;
                    transition: background 0.2s;
                    min-height: 48px;
                    align-items: center;
                }

                .gantt-institution-row:hover,
                .gantt-activity-row:hover {
                    background: #f8f9fa;
                }

                .gantt-institution-row .gantt-title-col {
                    background: #f8f9fa;
                    font-weight: 700;
                    color: #1351b4;
                }

                .gantt-activity-row .gantt-title-col {
                    padding-left: 2.5rem;
                }

                .activity-name {
                    color: #666;
                    font-size: 0.875rem;
                    font-weight: 400;
                    line-height: 1.4;
                }

                .activity-dates {
                    color: #1351b4;
                    font-size: 0.7rem;
                    font-weight: 500;
                }

                .gantt-bar {
                    position: absolute;
                    height: 24px;
                    border-radius: 4px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    align-items: center;
                    padding: 0 0.5rem;
                    min-width: 4px;
                }

                .gantt-bar-main {
                    background: #1351b4;
                    box-shadow: 0 2px 4px rgba(19, 81, 180, 0.3);
                }

                .gantt-bar-activity {
                    height: 18px;
                }

                .gantt-bar-activity-completed {
                    background: #168821;
                    border: 1px solid #0f6618;
                }

                .gantt-bar-activity-progress {
                    background: #1351b4;
                    border: 1px solid #0c3c87;
                }

                .gantt-bar-activity-planned {
                    background: #ff8c00;
                    border: 1px solid #cc7000;
                }

                .gantt-bar-label {
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                @media (max-width: 768px) {
                    .header-content {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .header-stats {
                        width: 100%;
                        justify-content: space-around;
                    }

                    .navbar {
                        flex-direction: column;
                        gap: 1rem;
                        padding: 1rem;
                    }

                    .toolbar {
                        flex-direction: column;
                    }

                    .institutions-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .activity-row-1,
                    .activity-row-2 {
                        grid-template-columns: 1fr;
                    }

                    .gantt-title-col {
                        width: 250px;
                        min-width: 250px;
                    }
                }
            `}</style>
        </div>
    );
}
