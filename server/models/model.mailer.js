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
      template: "views/passwordResetEmail",
      category: "Integration Test",
      context: { token },
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
