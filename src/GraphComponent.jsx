import React, { useEffect, useRef, useState } from "react";
import { Network } from "vis-network/standalone";
import data from "./countries.json";
import "./GraphComponent.css";

const GraphComponent = () => {
    const containerGrafo = useRef(null);
    const [pais, setPais] = useState("");
    const [dadosGrafo, setDadosGrafo] = useState({ nodes: [], edges: [] });
    const [maisColonizador, setMaisColonizador] = useState(null);
    const [menosColonizador, setMenosColonizador] = useState(null);
    const [metodoMaisUtilizado, setMetodoMaisUtilizado] = useState(null);

    const handleInputChange = (event) => setPais(event.target.value);

    const bfs = (nodes, edges, tipo) => {
        const listaAdjacencia = {};
        const contagemMetodos = {};
        const contagemColonizadores = {};

        edges.forEach(({ from, to, label }) => {
            listaAdjacencia[from] = listaAdjacencia[from] || [];
            listaAdjacencia[from].push(to);

            if (label) contagemMetodos[label] = (contagemMetodos[label] || 0) + 1;
        });

        Object.keys(listaAdjacencia).forEach((noInicial) => {
            const visitados = new Set([noInicial]);
            let fila = [noInicial];

            contagemColonizadores[noInicial] = 0;

            while (fila.length) {
                const no = fila.shift();
                listaAdjacencia[no]?.forEach((vizinho) => {
                    if (!visitados.has(vizinho)) {
                        visitados.add(vizinho);
                        fila.push(vizinho);
                        contagemColonizadores[noInicial] += 1;
                    }
                });
            }
        });

        const obterDadosPais = (tipo) => {
            return Object.entries(contagemColonizadores).reduce(
                (resultado, [chave, valor]) => {
                    if (
                        (tipo === "mais" && valor > resultado.contagem) ||
                        (tipo === "menos" && valor < resultado.contagem && valor > 0)
                    ) {
                        return { pais: chave, contagem: valor };
                    }
                    return resultado;
                },
                { pais: null, contagem: tipo === "mais" ? 0 : Infinity }
            );
        };

        const dadosPais = obterDadosPais(tipo);

        if (tipo === "mais") {
            setMaisColonizador(dadosPais.pais);
        } else {
            setMenosColonizador(dadosPais.pais);
        }

        const metodoMaisUtilizadoDados = Object.entries(contagemMetodos).reduce(
            (max, [metodo, contagem]) => (contagem > max.contagem ? { metodo, contagem } : max),
            { metodo: null, contagem: 0 }
        );

        setMetodoMaisUtilizado(metodoMaisUtilizadoDados.metodo);
    };

    useEffect(() => {
        const conjuntoDeNos = new Set();
        const arestas = [];

        data.forEach(({ pais, colonizador, metodo }) => {
            if (
                !pais ||
                pais.toLowerCase() === pais.toLowerCase() ||
                colonizador.toLowerCase() === pais.toLowerCase()
            ) {
                conjuntoDeNos.add(pais);
                conjuntoDeNos.add(colonizador);
                arestas.push({ from: colonizador, to: pais, label: metodo });
            }
        });

        const nos = Array.from(conjuntoDeNos).map((id) => ({
            id,
            label: id,
            shape: "dot",
            color: id === maisColonizador ? "red" : id === menosColonizador ? "blue" : "green",
            size: 40,
        }));

        const arestasAtualizadas = arestas.map((aresta) => ({
            ...aresta,
            color: aresta.label === metodoMaisUtilizado ? "red" : "gray",
        }));

        setDadosGrafo({ nodes: nos, edges: arestasAtualizadas });
    }, [pais, maisColonizador, menosColonizador, metodoMaisUtilizado]);

    useEffect(() => {
        if (containerGrafo.current && dadosGrafo.nodes.length) {
            const options = {
                nodes: { size: 30, font: { size: 16 }, color: "green" },
                edges: {
                    arrows: "to",
                    font: { size: 10, align: "middle" ,  color: "#404040"},
                    width: 1,
                    length: 250,
                },
                interaction: { hover: true },
            };

            new Network(containerGrafo.current, dadosGrafo, options);
        }
    }, [dadosGrafo]);

    return (
        <div>
            <div className="graph-header">
                <h1 className="graph-title">Grafo de Colonização</h1>
                <input
                    type="text"
                    placeholder="Pesquise um país"
                    value={pais}
                    onChange={handleInputChange}
                    className="graph-input"
                />
                <button onClick={() => bfs(dadosGrafo.nodes, dadosGrafo.edges, "mais")}>
                    País com mais colônias
                </button>
                <button onClick={() => bfs(dadosGrafo.nodes, dadosGrafo.edges, "menos")}>
                    País com menos colônias
                </button>
                <button onClick={() => bfs(dadosGrafo.nodes, dadosGrafo.edges, "metodo")}>
                    Método de colonização mais utilizado
                </button>
            </div>
            <div ref={containerGrafo} className="graph-container" />
        </div>
    );
};

export default GraphComponent;
