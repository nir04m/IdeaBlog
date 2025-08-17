// // app/components/theme/ThemeScript.tsx
// export function ThemeScript() {
//   return (
//     <script
//       dangerouslySetInnerHTML={{
//         __html: `
// (function(){
//   try {
//     var k='theme';
//     var m = localStorage.getItem(k) || 'system';
//     var dark = (m==='dark') || (m==='system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
//     var r = document.documentElement;
//     r.classList.toggle('dark', dark);
//     r.setAttribute('data-theme', dark ? 'dark' : 'light');
//   } catch(e){}
// })();`,
//       }}
//     />
//   );
// }
