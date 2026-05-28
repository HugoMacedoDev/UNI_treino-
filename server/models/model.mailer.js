import  { MailtrapClient } from "mailtrap";

const mailTrapClient = new MailtrapClient({
      token: process.env.MAILTRAP_TOKEN,
    });

export default function sendResetPasswordEmail(recipient, token) {
  const sender = {
    email: "hello@demomailtrap.co",
    name: "UniTreino",
  };

  mailTrapClient
    .send({
      from: sender,
      to: recipient,
      subject: "UniTreino - Redefinição de senha",
      html: `
    <table>
      <tr>
        <td class="content" style="font-family: sans-serif; padding: 20px; color: #333;">
          <p>Olá,</p>
          <p>
            Recebemos uma solicitação para redefinir a senha da sua conta. Use
            o token abaixo para concluir o processo. Ele é válido por apenas 1
            hora.
          </p>

          <!-- Box do Token -->
          <div class="token-box" style="background-color: #f4f4f5; border: 1px solid #e4e4e7; padding: 12px; font-family: monospace; font-size: 16px; text-align: center; border-radius: 6px; margin: 20px 0; font-weight: bold; letter-spacing: 1px;">
            ${token}
          </div>

          <p>
            Se você não solicitou a alteração de senha, ignore este e-mail por
            segurança. Nenhuma alteração será feita.
          </p>
          <p>Atenciosamente,<br />Equipe de Suporte</p>
        </td>
      </tr>
    </table>
  `,
      category: "Integration Test",
    })
    .then(console.log, console.error);
}

// const { email, token, password } = req.body; // Recebe o e-mail, o token e a nova senha

//   try {
//     // Busca o usuário e força a seleção dos campos que estão ocultos por padrão (select: false)
//     const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');

//     // 1ª Verificação: Se o usuário existe
//     if (!user) {
//       return res.status(400).send({ error: 'User not found' });
//     }

//     // 2ª Verificação: Se o token enviado é igual ao token salvo no banco
//     if (token !== user.passwordResetToken) {
//       return res.status(400).send({ error: 'Token invalid' });
//     }

//     // 3ª Verificação: Se o token já expirou (compara a data atual com a de expiração)
//     const now = new Date();
//     if (now > user.passwordResetExpires) {
//       return res.status(400).send({ error: 'Token expired, generate a new one' });
//     }

//     // Se passou em tudo, atualiza a senha do usuário
//     user.password = password;

//     // Salva o usuário (o hash da senha é gerado automaticamente pelo Mongoose antes de salvar)
//     await user.save();

//     // Retorna o status de sucesso 200
//     return res.send();

//   } catch (err) {
//     // Captura qualquer erro inesperado e responde ao usuário
//     return res.status(400).send({ error: 'Cannot reset password, try again' });
//   }
