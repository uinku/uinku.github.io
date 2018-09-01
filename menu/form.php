<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Menu</title>
    </head>
    <body>
        <h1>Menu</h1>
        <form id="menu-form" action="validate.php">
            <table>
                <tr>
                    <td>
                        <label for="menu-form">First Name:</label>
                    </td>
                    <td>
                        <input type="text" name="firstName" required>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="menu-form">Last Name:</label>
                    </td>
                    <td>
                        <input type="text" name="lastName" required>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="menu-form">Email:</label>
                    </td>
                    <td>
                        <input type="email" name="email" required>
                    </td>
                </tr>
            </table>
            <input type="submit" value="Register">
        </form>
    </body>
</html>