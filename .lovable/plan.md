**Objetivo:** Na tela de confirmação do agendamento ("Tudo certo, [nome]!"), adicionar um botão que redirecione o usuário para o WhatsApp com uma mensagem pré-escrita contendo data, horário e código do agendamento.

**Escopo:** Apenas o componente `Confirmation` em `src/routes/agendamentos.tsx`.

**Implementação:**
1.  Normalizar o número de WhatsApp informado (`+55 (48) 99173-5685` → `5548991735685`).
2.  Gerar a mensagem pré-escrita dinamicamente a partir das props do componente `Confirmation` (`date`, `time`, `id`):
    *   Formato: `Olá, Geyzi! Atendimento confirmado para {data} às {horário}. Meu código: {código}`
    *   A data será formatada como `DD/MM/YYYY` (ex: `10/06/2026`) para ser mais enxuta na mensagem.
3.  Construir a URL do WhatsApp: `https://wa.me/5548991735685?text={mensagemCodificada}`.
4.  Adicionar um botão visualmente consistente (estilo primário ou contorno) logo acima ou abaixo do botão "Voltar para a home", que abra o link em uma nova aba (`target="_blank"`, `rel="noopener noreferrer"`).
5.  Nenhuma outra funcionalidade, rota ou componente será alterado.