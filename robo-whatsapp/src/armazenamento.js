import fs from "node:fs";
import path from "node:path";

/**
 * Arquivo JSON simples, salvo de forma atômica (escreve num temporário e renomeia),
 * suficiente para um negócio pequeno. Para muitos clientes, troque por um banco (ex.: Supabase).
 */
export class ArquivoJson {
  constructor(caminho, valorInicial) {
    this.caminho = caminho;
    fs.mkdirSync(path.dirname(caminho), { recursive: true });
    if (fs.existsSync(caminho)) {
      this.dados = JSON.parse(fs.readFileSync(caminho, "utf8"));
    } else {
      this.dados = valorInicial;
      this.salvar();
    }
  }

  salvar() {
    const temporario = `${this.caminho}.tmp`;
    fs.writeFileSync(temporario, JSON.stringify(this.dados, null, 2));
    fs.renameSync(temporario, this.caminho);
  }
}
