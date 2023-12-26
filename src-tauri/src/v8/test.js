const res = [];
const data = [...read_xls()];
for (let i = 0; i < data.length; i++) {
    res.push(md5(i))
}
println(res.join("\n"))