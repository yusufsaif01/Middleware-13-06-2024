module.exports = ({ email, name, from }) => {
  return {
    to: email,
    subject: "Congratulations, You are now FootPlayer.",
    html(data) {
      return `
        <tbody style="display: block;width: 80%; margin:auto;">
			<tr style="height: 20px;">
				<td></td>
			</tr>
			<!-- Heading of template -->
			<tr style="display:block; width: 100%;text-align: center;">
				<td style="display:block; width: 100%; text-align: center;">
					<h1 style="font-family: 'Paytone One', sans-serif;
					font-size: 48px;font-weight: 700;color:#626262">
						Dear ${name},</h1>
				</td>
				<td style="display:block; width: 100%; text-align: center;">
					<h1 style="font-family: 'Paytone One', sans-serif;
					font-size: 48px;font-weight: 700;color:#626262">
						Congratulations, you are a</h1>
				</td>
				<td style="display:block; width: 100%; text-align: center;">
					<h1 style="font-family: 'Paytone One', sans-serif;
					font-size: 48px;font-weight: 700;color:#626262">
						FooTPlayer !</h1>
				</td>
			</tr>
			<!--  -->

			<!-- paragraph -->
			<tr style="height: 20px;">
				<td></td>
			</tr>
			<tr style="display:block; width: 100%;text-align: center;">
				<td style="display:block; width: 100%; text-align: center;">
					<p style="font-family: 'Montserrat', sans-serif;
					font-size: 16px;font-weight: 300;color:#626262;
					">
						You are now a footplayer associated with ${from}
						<br>Please click below to go to YFTChain portal and witness your new status with unlocked features.
						</p>
				</td>
			</tr>

			<tr style="height: 20px;">
				<td></td>
			</tr>

			<tr style="height: 40px;">
				<td></td>
			</tr>

			<tr style="display:block; width: 100%;text-align: center;">
				<td style=" display:block; width: 100%; text-align: center;">
					<a href="${data.appUrl}member/profile/view" style="background: #FF9933;display: inline-block; border:none; color: #fff;font-family: 'Montserrat',
						sans-serif;font-size: 18px;border-radius: 10px;text-decoration:none;padding: 15px 40px;">Go to my profile
					</a>
				</td>
			</tr>

			<tr style="height: 40px;">
				<td></td>
			</tr>

			<!-- See you online -->

			<tr style="display:block; width: 100%;text-align: center;">
				<td style=" display:block; width: 100%; text-align: center;">
					<p style="font-family: 'Montserrat', sans-serif;
					font-size: 18px;font-weight: 300;color:#626262;
					">
						See you online!
					</p>
					<p style="font-family: 'Montserrat', sans-serif;
					font-size: 20px; font-weight: 700;display:block;color:#626262;
					">YFTChain Team</p>
				</td>
			</tr>
			<tr style=" height: 20px;">
				<td></td>
			</tr>
			<!-- end  -->
		</tbody>
      `;
    },
    text: `Congratulations ${name}, You are now a FootPlayer.`,
  };
};
