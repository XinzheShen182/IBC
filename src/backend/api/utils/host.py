# Add One Host to /etc/hosts

def add_host(domain, ip="127.0.0.1"):
    host_file = "/etc/hosts"
    with open(host_file, "r") as f:
        contents = f.readlines()
    content = {x.split(" ")[1]: x.split(" ")[0] for x in contents if len(x.split(" ")) > 1}
    if domain in content:
        return
    with open(host_file, "a") as f:
        f.write(f"{ip} {domain}\n")
        

