const fs = require('fs');
const filePath = 'd:/Shop/shopidoo_sellerfrontend/src/pages/Settings/Security.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> (origin\/[^\r\n]*)/g;

let index = 0;
let newContent = content.replace(regex, (match, ours, theirs) => {
  console.log(`Resolving conflict ${index} in Security.jsx...`);
  let resolved = '';

  if (index === 0) {
    // Conflict 0: imports
    resolved = ours;
  } else if (index === 1) {
    // Conflict 1: OTP imports
    resolved = ours;
  } else if (index === 2) {
    // Conflict 2: VerifyButton and state
    // We want ours, but we need to insert `const navigate = useNavigate();` at the beginning of the component.
    // The component begins inside this block as:
    // `export default function Security() {`
    // `  const { user } = useSelector(state => state.auth);`
    let merged = ours.replace(
      'export default function Security() {',
      'export default function Security() {\n  const navigate = useNavigate();'
    );
    resolved = merged;
  } else if (index === 3) {
    // Conflict 3: cancel setForm
    resolved = ours;
  } else if (index === 4) {
    // Conflict 4: twoFactor payload
    resolved = ours;
  } else if (index === 5) {
    // Conflict 5: response save state
    resolved = ours;
  } else if (index === 6) {
    // Conflict 6: Card style
    resolved = ours;
  } else if (index === 7) {
    // Conflict 7: Header comment
    resolved = theirs;
  } else if (index === 8) {
    // Conflict 8: Identity verification header
    resolved = ours;
  } else if (index === 9) {
    // Conflict 9: mobile + change password + 2FA
    resolved = ours;
  } else if (index === 10) {
    // Conflict 10: SaveCancelButtons end
    resolved = ours;
  }

  index++;
  return resolved;
});

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully resolved Security.jsx conflicts!');
