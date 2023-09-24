const supabase = require("../../supabaseConfig.js");

//should be used only after signup
export const createUserAfterSignup = async (
  userID: string,
  userEmail: string
) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          user_id: userID,
          email: userEmail,
          latest_send_date: new Date(),
        },
      ])
      .select();

    if (error) {
      console.log(error);
      return;
    }

    console.log(`User data inserted into 'users'`, data);
  } catch (error) {}
};

// createUserAfterSignup(
//   "f8c88d61-5a0a-4067-92b5-b45ec709d93b",
//   "test@gmail.com"
// );
